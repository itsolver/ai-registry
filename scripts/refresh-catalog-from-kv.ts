import {
  normalizeModelsDevCatalog,
  type ArtificialAnalysisLlmSourceStatus,
  type ArtificialAnalysisModel,
  type VoiceSourceStatus,
} from "../src/registry";
import { catalogSpeechSources } from "../src/refresh-speech-sources";
import {
  fetchModelsDev,
  fetchUsdAudRate,
  persistArtificialAnalysisVoiceCapture,
  persistFetchedCatalog,
  type Env,
} from "../src/worker";

declare const process: {
  env: Record<string, string | undefined>;
};

const MANIFEST_KEY = "raw:aa:manifest:v1";
const MAX_CAPTURE_AGE_MS = 2 * 60 * 60 * 1000;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

const accountId = requiredEnvironment("CLOUDFLARE_ACCOUNT_ID");
const namespaceId = requiredEnvironment("CLOUDFLARE_KV_NAMESPACE_ID");
const token = requiredEnvironment("CLOUDFLARE_API_TOKEN");
const kvBase = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values`;

async function kvRequest(
  key: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(`${kvBase}/${encodeURIComponent(key)}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
}

async function kvGet(key: string): Promise<string | null> {
  const response = await kvRequest(key);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Cloudflare KV read failed for ${key}: ${response.status}`);
  }
  return response.text();
}

async function kvPut(
  key: string,
  value: string | ArrayBuffer | ArrayBufferView,
  options?: KVNamespacePutOptions,
): Promise<void> {
  const url = new URL(`${kvBase}/${encodeURIComponent(key)}`);
  if (options?.expirationTtl) {
    url.searchParams.set("expiration_ttl", String(options.expirationTtl));
  }
  const response = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: value as BodyInit,
  });
  if (!response.ok) {
    throw new Error(`Cloudflare KV write failed for ${key}: ${response.status}`);
  }
}

const remoteKv = {
  get: kvGet,
  put: kvPut,
} as unknown as KVNamespace;

interface RawCaptureManifest {
  capturedAt: string;
  sources: Record<string, string>;
}

function parseJson(value: string, source: string): Record<string, unknown> {
  const parsed = JSON.parse(value) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${source} is not a JSON object`);
  }
  return parsed as Record<string, unknown>;
}

async function capturedJson(
  manifest: RawCaptureManifest,
  source: string,
): Promise<Record<string, unknown>> {
  const key = manifest.sources[source];
  if (!key) throw new Error(`Raw capture is missing ${source}`);
  const value = await kvGet(key);
  if (!value) throw new Error(`Raw capture value is missing for ${source}`);
  return parseJson(value, source);
}

function validAaIdentity(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const creator = record.model_creator;
  return (
    typeof record.id === "string" &&
    record.id.trim().length > 0 &&
    typeof record.name === "string" &&
    record.name.trim().length > 0 &&
    typeof record.slug === "string" &&
    record.slug.trim().length > 0 &&
    Boolean(creator) &&
    typeof creator === "object" &&
    !Array.isArray(creator)
  );
}

async function capturedFreeModels(
  manifest: RawCaptureManifest,
): Promise<ArtificialAnalysisModel[]> {
  const models: ArtificialAnalysisModel[] = [];
  let totalPages: number | undefined;
  for (let page = 1; ; page += 1) {
    const body = await capturedJson(manifest, `free-${page}`);
    const pagination = body.pagination;
    if (
      !pagination ||
      typeof pagination !== "object" ||
      Array.isArray(pagination)
    ) {
      throw new Error(`AA free page ${page} has invalid pagination`);
    }
    const pageInfo = pagination as Record<string, unknown>;
    if (
      pageInfo.page !== page ||
      !Number.isInteger(pageInfo.total_pages) ||
      (pageInfo.total_pages as number) < page ||
      typeof pageInfo.has_more !== "boolean" ||
      pageInfo.has_more !== (page < (pageInfo.total_pages as number)) ||
      (totalPages !== undefined && pageInfo.total_pages !== totalPages) ||
      !Array.isArray(body.data) ||
      body.data.length === 0 ||
      body.data.some((model) => !validAaIdentity(model))
    ) {
      throw new Error(`AA free page ${page} is partial or inconsistent`);
    }
    totalPages = pageInfo.total_pages as number;
    if (totalPages > 4) {
      throw new Error(`AA free source requires ${totalPages} pages; capture limit is 4`);
    }
    models.push(...(body.data as ArtificialAnalysisModel[]));
    if (!pageInfo.has_more) return models;
  }
}

function apiRows<T>(body: Record<string, unknown>, source: string): T[] {
  if (!Array.isArray(body.data) || body.data.length === 0) {
    throw new Error(`${source} is empty or invalid`);
  }
  return body.data as T[];
}

async function main(): Promise<void> {
  const manifestValue = await kvGet(MANIFEST_KEY);
  if (!manifestValue) throw new Error("Raw AA capture manifest is unavailable");
  const manifest = parseJson(
    manifestValue,
    "raw capture manifest",
  ) as unknown as RawCaptureManifest;
  if (
    typeof manifest.capturedAt !== "string" ||
    !Number.isFinite(Date.parse(manifest.capturedAt)) ||
    !manifest.sources ||
    typeof manifest.sources !== "object"
  ) {
    throw new Error("Raw AA capture manifest is invalid");
  }
  const captureAgeMs = Date.now() - Date.parse(manifest.capturedAt);
  if (
    captureAgeMs > MAX_CAPTURE_AGE_MS ||
    captureAgeMs < -MAX_CLOCK_SKEW_MS
  ) {
    throw new Error("Raw AA capture manifest is outside the allowed age");
  }

  const [modelsDev, exchangeRate, freeModels, sttBody, s2sBody] =
    await Promise.all([
      fetchModelsDev({} as Env),
      fetchUsdAudRate({} as Env),
      capturedFreeModels(manifest),
      capturedJson(manifest, "stt"),
      capturedJson(manifest, "s2s"),
    ]);
  const legacyBody = manifest.sources.llm
    ? await capturedJson(manifest, "llm")
    : undefined;
  const legacyModels = legacyBody
    ? apiRows<ArtificialAnalysisModel>(legacyBody, "AA LLM")
    : [];
  const speechSources = catalogSpeechSources(
    sttBody,
    s2sBody,
    manifest.capturedAt,
  );
  const sttModels = speechSources.speechToTextModels;
  const s2sModels = speechSources.speechToSpeechModels;
  const liveModels = [...legacyModels, ...freeModels];
  const liveCandidateIds = [
    ...new Set(
      liveModels
        .map((model) =>
          typeof model.slug === "string"
            ? model.slug.trim()
            : typeof model.id === "string"
              ? model.id.trim()
              : "",
        )
        .filter(Boolean),
    ),
  ];
  const llmStatus: ArtificialAnalysisLlmSourceStatus = {
    state: "live",
    evidenceTime: manifest.capturedAt,
    liveRowCount: liveCandidateIds.length,
    liveRowCounts: {
      llmApi: legacyModels.length,
      freeLlmApi: freeModels.length,
    },
    liveCandidateIds,
  };
  const voiceStatus: VoiceSourceStatus = speechSources.voiceStatus;
  if (speechSources.shouldPersistVoiceCapture) {
    await persistArtificialAnalysisVoiceCapture(
      { MODEL_CACHE: remoteKv },
      s2sModels,
      manifest.capturedAt,
    );
  }
  const catalog = normalizeModelsDevCatalog(
    modelsDev,
    new Date().toISOString(),
    exchangeRate,
    liveModels,
    sttModels,
    s2sModels,
    voiceStatus,
    llmStatus,
  );
  await persistFetchedCatalog({ MODEL_CACHE: remoteKv }, catalog);
  console.log(
    JSON.stringify({
      generatedAt: catalog.generatedAt,
      evidenceTime: manifest.capturedAt,
      modelCount: catalog.modelCount,
      benchmarkCount: catalog.benchmarkCandidates?.length ?? 0,
    }),
  );
}

await main();
