import { HOME_HTML } from "./html";
import { ITS_BENCHMARK_HTML } from "./its-benchmark";
import { WEBDEV_BENCHMARK_HTML } from "./webdev-benchmark";
import {
  normalizeArtificialAnalysisSpeechToSpeechRecords,
  parseArtificialAnalysisSpeechToSpeechApi,
  parseArtificialAnalysisSpeechToSpeechPage,
} from "./aa-speech-to-speech";
import {
  AA_SPEECH_TO_SPEECH_EXTRACTED_AT,
  AA_SPEECH_TO_SPEECH_MODELS,
} from "./generated/aa-speech-to-speech";
import {
  asProvider,
  benchmarkCandidateEligibilityReason,
  benchmarkCandidates,
  filterModels,
  isBenchmarkCandidateRecommendedForFilters,
  latestCostQualitySelection,
  latestForProvider,
  normalizeModelsDevCatalog,
  parseFilters,
  recommendationFamilyKey,
  recommendModelFailovers,
  rankedRecommendedModels,
  type ArtificialAnalysisModel,
  type ArtificialAnalysisLlmSourceStatus,
  type ArtificialAnalysisSpeechToSpeechModel,
  type ArtificialAnalysisSpeechToTextModel,
  type Catalog,
  type ExchangeRate,
  type ModelsDevDocument,
  type ProviderId,
  type RecommendedModel,
  type VoiceSourceStatus,
} from "./registry";

const CACHE_KEY = "catalog:v31";
const VOICE_CACHE_KEY = "aa:s2s:last-known-good:v1";
const MODELS_DEV_COVERAGE_KEY = "models-dev:provider-high-water:v1";
const RAW_CAPTURE_MANIFEST_KEY = "raw:aa:manifest:v1";
const CACHE_FRESHNESS_MS = 60 * 60 * 1000;
const CACHE_LAST_GOOD_TTL_SECONDS = 7 * 24 * 60 * 60;
const RAW_CAPTURE_MAX_ATTEMPTS = 3;
const RAW_CAPTURE_RETRY_BASE_MS = 250;
const ARTIFICIAL_ANALYSIS_MIN_COVERAGE_RATIO = 0.5;
const VOICE_FALLBACK_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const VOICE_MIN_COVERAGE_RATIO = 0.5;
const VOICE_INITIAL_API_MIN_ROW_COUNT = 8;
const MODELS_DEV_MIN_COVERAGE_RATIO = 0.5;
const DEFAULT_FX_RATE_URL =
  "https://api.frankfurter.dev/v1/latest?base=USD&symbols=AUD";
const DEFAULT_MODELS_DEV_URL = "https://models.dev/api.json";
const DEFAULT_ARTIFICIAL_ANALYSIS_LLM_URL =
  "https://artificialanalysis.ai/api/v2/data/llms/models";
const DEFAULT_ARTIFICIAL_ANALYSIS_FREE_LLM_URL =
  "https://artificialanalysis.ai/api/v2/language/models/free";
const DEFAULT_ARTIFICIAL_ANALYSIS_STT_URL =
  "https://artificialanalysis.ai/api/v2/media/speech-to-text/models";
const DEFAULT_ARTIFICIAL_ANALYSIS_S2S_URL =
  "https://artificialanalysis.ai/api/v2/media/speech-to-speech/models";
const DEFAULT_ARTIFICIAL_ANALYSIS_S2S_PAGE_URL =
  "https://artificialanalysis.ai/speech-to-speech";
const REQUIRED_MODELS_DEV_PROVIDERS = [
  "openai",
  "google",
  "xai",
  "anthropic",
  "nvidia",
  "groq",
] as const;

export interface Env {
  MODEL_CACHE?: KVNamespace;
  MODELS_DEV_URL?: string;
  FX_RATE_URL?: string;
  ARTIFICIAL_ANALYSIS_API_KEY?: string;
  ARTIFICIAL_ANALYSIS_LLM_URL?: string;
  ARTIFICIAL_ANALYSIS_FREE_LLM_URL?: string;
  ARTIFICIAL_ANALYSIS_STT_URL?: string;
  ARTIFICIAL_ANALYSIS_S2S_URL?: string;
  ARTIFICIAL_ANALYSIS_S2S_PAGE_URL?: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    return handleRequest(request, env, ctx);
  },

  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(captureArtificialAnalysisRawSources(env));
  },
};

export async function handleRequest(
  request: Request,
  env: Env,
  ctx?: Pick<ExecutionContext, "waitUntil">,
): Promise<Response> {
  if (request.method === "OPTIONS") return optionsResponse();

  if (request.method !== "GET") {
    return jsonResponse({ error: "method_not_allowed" }, 405, {
      Allow: "GET, OPTIONS",
    });
  }

  const url = new URL(request.url);
  const route = normalizeRoute(url.pathname);

  if (route === "/") {
    return htmlResponse(HOME_HTML);
  }

  if (route === "/its") {
    return Response.redirect(new URL("/its-eval", request.url), 301);
  }

  if (route === "/its-eval") {
    return htmlResponse(ITS_BENCHMARK_HTML);
  }

  if (route === "/webdev") {
    return htmlResponse(WEBDEV_BENCHMARK_HTML);
  }

  if (route === "/favicon.ico") {
    return new Response(null, { status: 204, headers: commonHeaders() });
  }

  if (route === "/models.json" || route === "/model-registry.json") {
    return jsonResponse({ error: "not_found" }, 404);
  }

  try {
    const catalog = await getCatalog(env, ctx);
    return routeApi(route, url.searchParams, catalog);
  } catch (error) {
    return jsonResponse(
      {
        error: "catalog_unavailable",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load model catalog.",
      },
      503,
    );
  }
}

export async function refreshCatalog(env: Env): Promise<Catalog> {
  const [cached, highWater] = await Promise.all([
    readCachedCatalog(env),
    readProviderCoverageHighWater(env),
  ]);
  const fetched = await fetchCatalog(env);
  return persistFetchedCatalog(env, fetched, cached, highWater);
}

export async function persistFetchedCatalog(
  env: Env,
  fetched: Catalog,
  cached?: Catalog,
  highWater?: ProviderCoverageHighWater,
): Promise<Catalog> {
  const currentCached = cached ?? (await readCachedCatalog(env));
  const currentHighWater =
    highWater ?? (await readProviderCoverageHighWater(env));
  assertProviderCoverage(fetched, currentCached, currentHighWater);
  const nextHighWater = providerCoverageHighWater(
    fetched,
    currentCached,
    currentHighWater,
  );
  await writeCatalogState(env, fetched, nextHighWater);
  return fetched;
}

interface RawCaptureManifest {
  capturedAt: string;
  sources: Record<string, string>;
}

interface RawCaptureSource {
  name: string;
  url: string;
  required: boolean;
}

class RawCaptureHttpError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
  }
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function captureArtificialAnalysisRawSource(
  env: Env,
  source: RawCaptureSource,
  captureId: string,
  headers: Record<string, string>,
): Promise<string> {
  const key = `raw:aa:${captureId}:${source.name}`;
  let lastError: unknown;

  for (let attempt = 1; attempt <= RAW_CAPTURE_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(source.url, { headers });
      if (!response.ok || !response.body) {
        if (response.body) {
          await response.body.cancel().catch(() => undefined);
        }
        throw new RawCaptureHttpError(
          `${source.name} returned ${response.status}`,
          response.status === 408 ||
            response.status === 429 ||
            response.status >= 500,
        );
      }
      await env.MODEL_CACHE!.put(key, response.body, {
        expirationTtl: CACHE_LAST_GOOD_TTL_SECONDS,
      });
      return key;
    } catch (error) {
      lastError = error;
      const retryable =
        !(error instanceof RawCaptureHttpError) || error.retryable;
      if (!retryable || attempt === RAW_CAPTURE_MAX_ATTEMPTS) throw error;
      await wait(RAW_CAPTURE_RETRY_BASE_MS * 2 ** (attempt - 1));
    }
  }

  throw lastError;
}

export async function captureArtificialAnalysisRawSources(
  env: Env,
): Promise<RawCaptureManifest> {
  if (!env.MODEL_CACHE || !env.ARTIFICIAL_ANALYSIS_API_KEY) {
    throw new Error("Artificial Analysis raw capture is not configured");
  }
  const capturedAt = new Date().toISOString();
  const captureId = String(Date.now());
  const headers = {
    Accept: "application/json",
    "x-api-key": env.ARTIFICIAL_ANALYSIS_API_KEY,
  };
  const sourceDefinitions: RawCaptureSource[] = [
    {
      name: "llm",
      url: env.ARTIFICIAL_ANALYSIS_LLM_URL || DEFAULT_ARTIFICIAL_ANALYSIS_LLM_URL,
      required: false,
    },
    ...[1, 2, 3, 4].map((page) => ({
      name: `free-${page}`,
      url: paginatedUrl(
        env.ARTIFICIAL_ANALYSIS_FREE_LLM_URL ||
          DEFAULT_ARTIFICIAL_ANALYSIS_FREE_LLM_URL,
        page,
      ),
      required: page === 1,
    })),
    {
      name: "stt",
      url: env.ARTIFICIAL_ANALYSIS_STT_URL || DEFAULT_ARTIFICIAL_ANALYSIS_STT_URL,
      required: true,
    },
    {
      name: "s2s",
      url: env.ARTIFICIAL_ANALYSIS_S2S_URL || DEFAULT_ARTIFICIAL_ANALYSIS_S2S_URL,
      required: true,
    },
  ];
  const sources: Record<string, string> = {};
  for (const source of sourceDefinitions) {
    try {
      sources[source.name] = await captureArtificialAnalysisRawSource(
        env,
        source,
        captureId,
        headers,
      );
    } catch (error) {
      if (source.required) throw error;
    }
  }
  const manifest = { capturedAt, sources };
  await env.MODEL_CACHE.put(
    RAW_CAPTURE_MANIFEST_KEY,
    JSON.stringify(manifest),
    { expirationTtl: CACHE_LAST_GOOD_TTL_SECONDS },
  );
  return manifest;
}

function withoutNestedFailover(model: RecommendedModel): RecommendedModel {
  const { failover: _failover, ...modelWithoutFailover } =
    model as RecommendedModel & { failover?: unknown };
  return modelWithoutFailover as RecommendedModel;
}

function withNestedFailover(
  recommendation: RecommendedModel,
  failover: RecommendedModel | undefined,
): RecommendedModel & { failover: RecommendedModel | null } {
  return {
    ...withoutNestedFailover(recommendation),
    failover: failover ? withoutNestedFailover(failover) : null,
  };
}

function nextRecommendedFailover(
  recommendations: RecommendedModel[],
  provider?: ProviderId,
): RecommendedModel | undefined {
  const recommendation = recommendations[0];
  if (!recommendation) return undefined;
  const recommendationFamily = recommendationFamilyKey(recommendation);

  return recommendations
    .slice(1)
    .find(
      (candidate) =>
        (!provider || candidate.provider === provider) &&
        recommendationFamilyKey(candidate) !== recommendationFamily,
    );
}

function hasItsAutoCloseBenchmark(model: RecommendedModel): boolean {
  return Boolean(model.benchmarks?.llm?.autoClose);
}

async function routeApi(
  route: string,
  params: URLSearchParams,
  catalog: Catalog,
): Promise<Response> {
  if (route === "/health") {
    return jsonResponse({
      ...catalogResponseMetadata(catalog),
      status: "ok",
      apiVersion: "v1",
      providerCount: catalog.providers.length,
      modelCount: catalog.modelCount,
      activeModelCount: catalog.activeModelCount,
      registryModelCount: catalog.models.length,
      benchmarkCount: catalog.benchmarkCandidates?.length ?? 0,
      recommendableCount:
        catalog.benchmarkCandidates?.filter((candidate) => candidate.recommendable)
          .length ?? 0,
    });
  }

  if (route === "/models/providers") {
    return jsonResponse({
      ...catalogResponseMetadata(catalog),
      providers: catalog.providers,
    });
  }

  if (route === "/models/recommend") {
    const filters = parseFilters(params);
    const rankedRecommendations = rankedRecommendedModels(catalog, filters);
    const recommendation = rankedRecommendations[0];
    if (!recommendation) {
      return jsonResponse(
        {
          error: "not_found",
          message: "No model matches the supplied filters.",
        },
        404,
      );
    }
    const recommendationWithFailover = withNestedFailover(
      recommendation,
      nextRecommendedFailover(rankedRecommendations, filters.provider),
    );

    const requestedFailovers = 2;
    const failovers = recommendModelFailovers(
      catalog,
      filters,
      requestedFailovers,
    );
    const eligibleAutoCloseFallbackCount =
      filters.useCase === "customer-support"
        ? rankedRecommendedModels(catalog, {
            ...filters,
            includeItsBenchmark: true,
          }).filter(
            (candidate) =>
              candidate.id !== recommendation.id &&
              hasItsAutoCloseBenchmark(candidate),
          ).length
        : 0;
    const failoverStatus = {
      requested: requestedFailovers,
      returned: failovers.length,
      ...(filters.useCase === "customer-support" &&
      failovers.length < requestedFailovers
        ? {
            reason:
              eligibleAutoCloseFallbackCount >= requestedFailovers
                ? "insufficient_distinct_model_families"
                : "insufficient_its_autoclose_benchmarks",
          }
        : {}),
    };

    return jsonResponse({
      ...catalogResponseMetadata(catalog),
      recommendation: recommendationWithFailover,
      ...(filters.useCase
        ? {
            recommendationMeta: recommendationMeta(
              catalog,
              filters,
              recommendation,
            ),
          }
        : {}),
      failovers,
      failoverStatus,
    });
  }

  if (route === "/benchmarks") {
    const filters = parseFilters(params);
    const candidateRows = benchmarkCandidates(catalog, filters);
    const rows = candidateRows.map((row) => ({
      ...row,
      recommendable: isBenchmarkCandidateRecommendedForFilters(row, filters),
      eligibilityReason: benchmarkCandidateEligibilityReason(row, filters),
    }));
    return jsonResponse({
      ...catalogResponseMetadata(catalog),
      benchmarkCount: rows.length,
      benchmarks: rows,
    });
  }

  if (route === "/models") {
    const filters = parseFilters(params);
    const models = filterModels(catalog.models, filters);
    return jsonResponse({
      ...catalogResponseMetadata(catalog),
      modelCount: models.length,
      models,
    });
  }

  const latestMatch = route.match(/^\/models\/([^/]+)\/latest$/);
  if (latestMatch) {
    const provider = asProvider(latestMatch[1]);
    if (!provider) {
      return jsonResponse({ error: "not_found" }, 404);
    }

    const model = latestForProvider(catalog, provider);
    if (!model) {
      return jsonResponse({ error: "not_found" }, 404);
    }

    return jsonResponse({
      ...catalogResponseMetadata(catalog),
      model,
    });
  }

  return jsonResponse({ error: "not_found" }, 404);
}

function recommendationMeta(
  catalog: Catalog,
  filters: ReturnType<typeof parseFilters>,
  recommendation: RecommendedModel,
): Record<string, unknown> {
  if (
    filters.useCase === "customer-support" &&
    filters.selectionPolicy === "latest-cost-quality"
  ) {
    const selection = latestCostQualitySelection(catalog, filters);
    const selected = selection.selected ?? recommendation;
    const selectedSignals = selected.benchmarks?.llm;
    return {
      policy: "latest-cost-quality",
      selectionBasis: selection.selectionBasis,
      incumbent: recommendationAuditModel(selection.incumbent),
      selectedCandidate: recommendationAuditModel(selected),
      releaseDate: selected.releaseDate ?? null,
      aaTaskCostAud: selectedSignals?.intelligenceCostPerTask ?? null,
      aaIntelligence: selectedSignals?.intelligence ?? null,
      evidenceTime: selection.evidenceTime,
      catalogFresh: selection.catalogFresh,
    };
  }
  const latestRelease =
    filters.allowUnbenchmarkedLatest === true && !("source" in recommendation);
  const tier = filters.tier ?? "fast";
  return {
    policy: latestRelease
      ? "allow_unbenchmarked_latest"
      : "benchmark_required",
    selectionBasis: latestRelease ? "latest_release" : "benchmark",
    benchmarkEligible:
      "source" in recommendation ? recommendation.recommendable : false,
    valueOptimized: !latestRelease && tier !== "best",
  };
}

function recommendationAuditModel(
  model: RecommendedModel | undefined,
): Record<string, unknown> | null {
  if (!model) return null;
  return {
    provider: model.provider,
    id: model.id,
    releaseDate: model.releaseDate ?? null,
    aaTaskCostAud:
      model.benchmarks?.llm?.intelligenceCostPerTask ?? null,
    aaIntelligence: model.benchmarks?.llm?.intelligence ?? null,
  };
}

function catalogResponseMetadata(catalog: Catalog): Record<string, unknown> {
  const generatedAt = Date.parse(catalog.generatedAt);
  const ageMs = Number.isFinite(generatedAt)
    ? Math.max(0, Date.now() - generatedAt)
    : Number.POSITIVE_INFINITY;
  return {
    generatedAt: catalog.generatedAt,
    pricingCurrency: catalog.exchangeRate?.quote ?? "USD",
    sourcePricingCurrency: catalog.exchangeRate?.base ?? "USD",
    ...(catalog.exchangeRate ? { exchangeRate: catalog.exchangeRate } : {}),
    ...(catalog.sourceStatus ? { sourceStatus: catalog.sourceStatus } : {}),
    catalogState: ageMs <= CACHE_FRESHNESS_MS ? "fresh" : "stale",
    catalogAgeSeconds: Number.isFinite(ageMs)
      ? Math.floor(ageMs / 1000)
      : null,
  };
}

async function getCatalog(
  env: Env,
  _ctx?: Pick<ExecutionContext, "waitUntil">,
): Promise<Catalog> {
  const cached = await readCachedCatalog(env);
  // Request events have a much lower CPU allowance than scheduled events.
  // Serve the valid seven-day last-good catalog even when it is marked stale;
  // the hourly scheduled handler is the only automatic refresh path.
  if (cached) return cached;
  if (env.MODEL_CACHE) {
    throw new Error("No valid cached catalog is available");
  }

  // Local development and unit tests can run without a KV binding. Production
  // always has MODEL_CACHE and therefore never performs source work on request.
  return fetchCatalog(env);
}

async function readCachedCatalog(env: Env): Promise<Catalog | undefined> {
  const value = await env.MODEL_CACHE?.get(CACHE_KEY);
  if (!value) return undefined;

  try {
    return applyCurrentVoiceFallbackAge(JSON.parse(value) as Catalog);
  } catch {
    return undefined;
  }
}

async function writeCachedCatalog(env: Env, catalog: Catalog): Promise<void> {
  await env.MODEL_CACHE?.put(CACHE_KEY, JSON.stringify(catalog), {
    expirationTtl: CACHE_LAST_GOOD_TTL_SECONDS,
  });
}

type ProviderCoverageHighWater = Partial<Record<ProviderId, number>>;

async function readProviderCoverageHighWater(
  env: Env,
): Promise<ProviderCoverageHighWater | undefined> {
  const value = await env.MODEL_CACHE?.get(MODELS_DEV_COVERAGE_KEY);
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const highWater: ProviderCoverageHighWater = {};
    for (const [key, count] of Object.entries(parsed)) {
      const provider = asProvider(key);
      if (
        provider &&
        typeof count === "number" &&
        Number.isFinite(count) &&
        count > 0
      ) {
        highWater[provider] = Math.floor(count);
      }
    }
    return Object.keys(highWater).length ? highWater : undefined;
  } catch {
    return undefined;
  }
}

async function writeCatalogState(
  env: Env,
  catalog: Catalog,
  highWater: ProviderCoverageHighWater,
): Promise<void> {
  await env.MODEL_CACHE?.put(
    MODELS_DEV_COVERAGE_KEY,
    JSON.stringify(highWater),
  );
  await writeCachedCatalog(env, catalog);
}

function assertProviderCoverage(
  catalog: Catalog,
  cached: Catalog | undefined,
  highWater: ProviderCoverageHighWater | undefined,
): void {
  const baseline: ProviderCoverageHighWater = { ...(highWater ?? {}) };
  if (Array.isArray(cached?.providers)) {
    for (const provider of cached.providers) {
      baseline[provider.provider] = Math.max(
        baseline[provider.provider] ?? 0,
        provider.total,
      );
    }
  }

  for (const [provider, rowCount] of Object.entries(baseline) as Array<
    [ProviderId, number]
  >) {
    if (rowCount <= 0) continue;
    const current =
      catalog.providers.find(
        (summary) => summary.provider === provider,
      )?.total ?? 0;
    if (
      current <
      Math.max(1, Math.ceil(rowCount * MODELS_DEV_MIN_COVERAGE_RATIO))
    ) {
      throw new Error(
        `models.dev refresh dropped cached provider coverage for ${provider}`,
      );
    }
  }

  const cachedAaStatus = cached?.sourceStatus?.artificialAnalysisLlm;
  const fetchedAaStatus = catalog.sourceStatus?.artificialAnalysisLlm;
  if (cachedAaStatus?.liveRowCounts && fetchedAaStatus?.liveRowCounts) {
    for (const source of ["llmApi", "freeLlmApi"] as const) {
      assertAaSourceCoverage(
        source,
        fetchedAaStatus.liveRowCounts[source],
        cachedAaStatus.liveRowCounts[source],
      );
    }
  } else {
    const cachedAaCount =
      cachedAaStatus?.liveRowCount ??
      cached?.benchmarkCandidates?.filter(
        (candidate) =>
          candidate.source === "artificialanalysis" &&
          candidate.benchmarks.llm !== undefined,
      ).length ??
      0;
    assertAaSourceCoverage(
      "aggregate",
      fetchedAaStatus?.liveRowCount ?? 0,
      cachedAaCount,
    );
  }
}

function assertAaSourceCoverage(
  source: "llmApi" | "freeLlmApi" | "aggregate",
  fetchedCount: number,
  cachedCount: number,
): void {
  if (
    cachedCount > 0 &&
    fetchedCount <
      Math.max(
        1,
        Math.ceil(cachedCount * ARTIFICIAL_ANALYSIS_MIN_COVERAGE_RATIO),
      )
  ) {
    throw new Error(
      `Artificial Analysis ${source} refresh returned ${fetchedCount} live LLM rows; expected at least half of the ${cachedCount}-row last-good source`,
    );
  }
}

function providerCoverageHighWater(
  catalog: Catalog,
  cached: Catalog | undefined,
  highWater: ProviderCoverageHighWater | undefined,
): ProviderCoverageHighWater {
  const next: ProviderCoverageHighWater = { ...(highWater ?? {}) };
  for (const provider of cached?.providers ?? []) {
    next[provider.provider] = Math.max(
      next[provider.provider] ?? 0,
      provider.total,
    );
  }
  for (const provider of catalog.providers) {
    next[provider.provider] = Math.max(
      next[provider.provider] ?? 0,
      provider.total,
    );
  }
  return next;
}

async function fetchCatalog(env: Env): Promise<Catalog> {
  const generatedAt = new Date().toISOString();
  const [
    modelsDev,
    exchangeRate,
    legacyArtificialAnalysisModels,
    currentArtificialAnalysisModels,
    artificialAnalysisSpeechToTextModels,
    artificialAnalysisSpeechToSpeech,
  ] = await Promise.all([
    fetchModelsDev(env),
    fetchUsdAudRate(env),
    fetchArtificialAnalysisModels(env),
    fetchArtificialAnalysisFreeModels(env),
    fetchArtificialAnalysisSpeechToTextModels(env),
    fetchArtificialAnalysisSpeechToSpeechModels(env),
  ]);
  const liveLlmModels = [
    ...legacyArtificialAnalysisModels,
    ...currentArtificialAnalysisModels,
  ];
  const liveCandidateIds = [
    ...new Set(
      liveLlmModels
        .map((model) => {
          if (typeof model.slug === "string" && model.slug.trim()) {
            return model.slug.trim();
          }
          return typeof model.id === "string" ? model.id.trim() : "";
        })
        .filter(Boolean),
    ),
  ];
  const llmSourceStatus: ArtificialAnalysisLlmSourceStatus = {
    state: currentArtificialAnalysisModels.length > 0 ? "live" : "bundled",
    evidenceTime:
      currentArtificialAnalysisModels.length > 0 ? generatedAt : null,
    liveRowCount: liveCandidateIds.length,
    liveRowCounts: {
      llmApi: legacyArtificialAnalysisModels.length,
      freeLlmApi: currentArtificialAnalysisModels.length,
    },
    liveCandidateIds,
  };

  return normalizeModelsDevCatalog(
    modelsDev,
    generatedAt,
    exchangeRate,
    [
      ...legacyArtificialAnalysisModels,
      ...currentArtificialAnalysisModels,
    ],
    artificialAnalysisSpeechToTextModels,
    artificialAnalysisSpeechToSpeech.models,
    artificialAnalysisSpeechToSpeech.status,
    llmSourceStatus,
  );
}

export async function fetchModelsDev(env: Env): Promise<ModelsDevDocument> {
  const response = await fetch(env.MODELS_DEV_URL || DEFAULT_MODELS_DEV_URL, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`models.dev returned ${response.status}`);
  }

  const source = await response.json();
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    throw new Error("models.dev returned an invalid catalog");
  }
  const document = source as ModelsDevDocument;
  for (const provider of REQUIRED_MODELS_DEV_PROVIDERS) {
    const models = document[provider]?.models;
    if (
      !models ||
      typeof models !== "object" ||
      Array.isArray(models) ||
      Object.keys(models).length === 0 ||
      Object.values(models).some((model) => !isCompleteModelsDevModel(model))
    ) {
      throw new Error(
        `models.dev returned an incomplete ${provider} catalog`,
      );
    }
  }
  return document;
}

function isCompleteModelsDevModel(model: unknown): boolean {
  if (!model || typeof model !== "object" || Array.isArray(model)) return false;
  const record = model as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    record.id.trim().length > 0 &&
    typeof record.name === "string" &&
    record.name.trim().length > 0 &&
    Boolean(record.modalities) &&
    typeof record.modalities === "object" &&
    !Array.isArray(record.modalities) &&
    Boolean(record.limit) &&
    typeof record.limit === "object" &&
    !Array.isArray(record.limit)
  );
}

async function fetchArtificialAnalysisModels(
  env: Env,
): Promise<ArtificialAnalysisModel[]> {
  if (!env.ARTIFICIAL_ANALYSIS_API_KEY) return [];

  try {
    const response = await fetch(
      env.ARTIFICIAL_ANALYSIS_LLM_URL || DEFAULT_ARTIFICIAL_ANALYSIS_LLM_URL,
      {
        headers: {
          Accept: "application/json",
          "x-api-key": env.ARTIFICIAL_ANALYSIS_API_KEY,
        },
      },
    );

    if (!response.ok) return [];

    const data = (await response.json()) as { data?: unknown };
    return Array.isArray(data.data)
      ? (data.data as ArtificialAnalysisModel[])
      : [];
  } catch {
    return [];
  }
}

async function fetchArtificialAnalysisFreeModels(
  env: Env,
): Promise<ArtificialAnalysisModel[]> {
  if (!env.ARTIFICIAL_ANALYSIS_API_KEY) return [];

  const baseUrl =
    env.ARTIFICIAL_ANALYSIS_FREE_LLM_URL ||
    DEFAULT_ARTIFICIAL_ANALYSIS_FREE_LLM_URL;
  const models: ArtificialAnalysisModel[] = [];
  let page = 1;
  let expectedTotalPages: number | undefined;

  for (;;) {
    const response = await fetch(paginatedUrl(baseUrl, page), {
      headers: {
        Accept: "application/json",
        "x-api-key": env.ARTIFICIAL_ANALYSIS_API_KEY,
      },
    });
    if (!response.ok) {
      throw new Error(
        `Artificial Analysis free language models returned ${response.status} on page ${page}`,
      );
    }

    const body = (await response.json()) as {
      data?: unknown;
      pagination?: unknown;
    };
    if (
      !body.pagination ||
      typeof body.pagination !== "object" ||
      Array.isArray(body.pagination)
    ) {
      throw new Error(
        `Artificial Analysis free language models returned invalid pagination on page ${page}`,
      );
    }
    const pagination = body.pagination as Record<string, unknown>;
    const responsePage = pagination.page;
    const totalPages = pagination.total_pages;
    const hasMore = pagination.has_more;
    if (
      !Number.isInteger(responsePage) ||
      responsePage !== page ||
      !Number.isInteger(totalPages) ||
      (totalPages as number) < page ||
      (totalPages as number) < 1 ||
      typeof hasMore !== "boolean" ||
      hasMore !== (page < (totalPages as number)) ||
      (expectedTotalPages !== undefined &&
        totalPages !== expectedTotalPages)
    ) {
      throw new Error(
        `Artificial Analysis free language models returned inconsistent pagination on page ${page}`,
      );
    }
    expectedTotalPages = totalPages as number;

    if (
      !Array.isArray(body.data) ||
      body.data.length === 0 ||
      body.data.some((model) => !isIdentityValidAaModel(model))
    ) {
      throw new Error(
        `Artificial Analysis free language models returned invalid data on page ${page}`,
      );
    }
    models.push(...(body.data as ArtificialAnalysisModel[]));

    if (!hasMore) {
      return models;
    }
    if (page >= 100) {
      throw new Error(
        "Artificial Analysis free language models exceeded 100 pages",
      );
    }
    page += 1;
  }
}

function isIdentityValidAaModel(model: unknown): boolean {
  if (!model || typeof model !== "object" || Array.isArray(model)) return false;
  const record = model as Record<string, unknown>;
  const creator = record.model_creator;
  return (
    isNonEmptyString(record.id) &&
    isNonEmptyString(record.name) &&
    isNonEmptyString(record.slug) &&
    Boolean(creator) &&
    typeof creator === "object" &&
    !Array.isArray(creator) &&
    isNonEmptyString((creator as Record<string, unknown>).name)
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function paginatedUrl(baseUrl: string, page: number): string {
  if (page === 1) return baseUrl;
  const url = new URL(baseUrl);
  url.searchParams.set("page", String(page));
  return url.toString();
}

async function fetchArtificialAnalysisSpeechToTextModels(
  env: Env,
): Promise<ArtificialAnalysisSpeechToTextModel[]> {
  if (!env.ARTIFICIAL_ANALYSIS_API_KEY) return [];

  try {
    const response = await fetch(
      env.ARTIFICIAL_ANALYSIS_STT_URL || DEFAULT_ARTIFICIAL_ANALYSIS_STT_URL,
      {
        headers: {
          Accept: "application/json",
          "x-api-key": env.ARTIFICIAL_ANALYSIS_API_KEY,
        },
      },
    );

    if (!response.ok) return [];

    const data = (await response.json()) as { data?: unknown };
    return Array.isArray(data.data)
      ? (data.data as ArtificialAnalysisSpeechToTextModel[])
      : [];
  } catch {
    return [];
  }
}

interface SpeechToSpeechSource {
  models: ArtificialAnalysisSpeechToSpeechModel[];
  status: VoiceSourceStatus;
}

type LiveVoiceOrigin = "aa_api" | "aa_public_page";
type VoiceCoverageHighWater = Partial<Record<LiveVoiceOrigin, number>>;

interface LastKnownGoodVoiceSource {
  fetchedAt: string;
  origin?: LiveVoiceOrigin;
  highWaterRowCounts: VoiceCoverageHighWater;
  models: ArtificialAnalysisSpeechToSpeechModel[];
}

export async function persistArtificialAnalysisVoiceCapture(
  env: Env,
  models: ArtificialAnalysisSpeechToSpeechModel[],
  fetchedAt: string,
): Promise<void> {
  const [cachedVoice, cachedCatalog] = await Promise.all([
    readLastKnownGoodVoiceSource(env),
    readCachedCatalog(env),
  ]);
  const highWaterRowCounts = cachedVoice?.highWaterRowCounts ?? {};
  const catalogVoice = cachedCatalog?.sourceStatus?.voice;
  const catalogApiHighWater =
    catalogVoice?.origin === "aa_api" ? catalogVoice.rowCount : undefined;
  const apiHighWater = Math.max(
    highWaterRowCounts.aa_api ?? 0,
    catalogApiHighWater ?? 0,
  );
  if (
    !validLiveVoiceModels(
      models,
      minimumVoiceRowCount(
        apiHighWater > 0 ? apiHighWater : undefined,
        VOICE_INITIAL_API_MIN_ROW_COUNT,
      ),
    )
  ) {
    throw new Error("Artificial Analysis voice capture is partial or invalid");
  }
  await persistLiveVoiceSource(
    env,
    models,
    fetchedAt,
    "aa_api",
    highWaterRowCounts,
  );
}

async function fetchArtificialAnalysisSpeechToSpeechModels(
  env: Env,
): Promise<SpeechToSpeechSource> {
  const fetchedAt = new Date().toISOString();
  const cached = await readLastKnownGoodVoiceSource(env);
  const bundled = [
    ...(AA_SPEECH_TO_SPEECH_MODELS as readonly ArtificialAnalysisSpeechToSpeechModel[]),
  ];
  const coverageHighWater = cached?.highWaterRowCounts ?? {};

  if (env.ARTIFICIAL_ANALYSIS_API_KEY) {
    try {
      const response = await fetch(
        env.ARTIFICIAL_ANALYSIS_S2S_URL ||
          DEFAULT_ARTIFICIAL_ANALYSIS_S2S_URL,
        {
          headers: {
            Accept: "application/json",
            "x-api-key": env.ARTIFICIAL_ANALYSIS_API_KEY,
          },
        },
      );
      if (response.ok) {
        const models = parseArtificialAnalysisSpeechToSpeechApi(
          await response.json(),
        );
        if (
          validLiveVoiceModels(
            models,
            minimumVoiceRowCount(
              coverageHighWater.aa_api,
              VOICE_INITIAL_API_MIN_ROW_COUNT,
            ),
          )
        ) {
          return await persistLiveVoiceSource(
            env,
            models,
            fetchedAt,
            "aa_api",
            coverageHighWater,
          );
        }
      }
    } catch {
      // The public page is the automatic secondary source.
    }
  }

  try {
    const response = await fetch(
      env.ARTIFICIAL_ANALYSIS_S2S_PAGE_URL ||
        DEFAULT_ARTIFICIAL_ANALYSIS_S2S_PAGE_URL,
      {
        headers: {
          Accept: "text/html",
          "User-Agent": "IT Solver AI Registry automatic refresh",
        },
      },
    );
    if (response.ok) {
      const models = parseArtificialAnalysisSpeechToSpeechPage(
        await response.text(),
      );
      if (
        validLiveVoiceModels(
          models,
          minimumVoiceRowCount(
            coverageHighWater.aa_public_page,
            Math.max(
              1,
              Math.ceil(bundled.length * VOICE_MIN_COVERAGE_RATIO),
            ),
          ),
        )
      ) {
        return await persistLiveVoiceSource(
          env,
          models,
          fetchedAt,
          "aa_public_page",
          coverageHighWater,
        );
      }
    }
  } catch {
    // Last-known-good KV and the bundled snapshot remain available below.
  }

  if (cached) {
    const status = fallbackVoiceStatus(
      "kv_last_known_good",
      cached.fetchedAt,
      cached.models.length,
    );
    console.warn("Artificial Analysis voice refresh using KV fallback", status);
    return { models: cached.models, status };
  }

  const status = fallbackVoiceStatus(
    "bundled_snapshot",
    AA_SPEECH_TO_SPEECH_EXTRACTED_AT,
    bundled.length,
  );
  console.warn("Artificial Analysis voice refresh using bundled fallback", status);
  return { models: bundled, status };
}

async function persistLiveVoiceSource(
  env: Env,
  models: ArtificialAnalysisSpeechToSpeechModel[],
  fetchedAt: string,
  origin: LiveVoiceOrigin,
  highWaterRowCounts: VoiceCoverageHighWater,
): Promise<SpeechToSpeechSource> {
  const nextHighWaterRowCounts = {
    ...highWaterRowCounts,
    [origin]: Math.max(highWaterRowCounts[origin] ?? 0, models.length),
  };
  await env.MODEL_CACHE?.put(
    VOICE_CACHE_KEY,
    JSON.stringify({
      fetchedAt,
      origin,
      highWaterRowCounts: nextHighWaterRowCounts,
      models,
    }),
  );
  return {
    models,
    status: { state: "live", origin, fetchedAt, rowCount: models.length },
  };
}

async function readLastKnownGoodVoiceSource(
  env: Env,
): Promise<LastKnownGoodVoiceSource | undefined> {
  const value = await env.MODEL_CACHE?.get(VOICE_CACHE_KEY);
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value) as {
      fetchedAt?: unknown;
      origin?: unknown;
      highWaterRowCount?: unknown;
      highWaterRowCounts?: unknown;
      models?: unknown;
    };
    if (typeof parsed.fetchedAt !== "string") return undefined;
    const models = normalizeArtificialAnalysisSpeechToSpeechRecords(
      parsed.models,
    );
    if (!models.length) return undefined;
    const origin = isLiveVoiceOrigin(parsed.origin) ? parsed.origin : undefined;
    const highWaterRowCounts = parseVoiceCoverageHighWater(
      parsed.highWaterRowCounts,
    );
    const legacyHighWaterRowCount =
      typeof parsed.highWaterRowCount === "number" &&
      Number.isFinite(parsed.highWaterRowCount)
        ? Math.max(models.length, Math.floor(parsed.highWaterRowCount))
        : models.length;
    if (origin) {
      highWaterRowCounts[origin] = Math.max(
        highWaterRowCounts[origin] ?? 0,
        legacyHighWaterRowCount,
      );
    }
    return {
      fetchedAt: parsed.fetchedAt,
      ...(origin ? { origin } : {}),
      highWaterRowCounts,
      models,
    };
  } catch {
    return undefined;
  }
}

function minimumVoiceRowCount(
  highWaterRowCount: number | undefined,
  initialMinimum: number,
): number {
  return highWaterRowCount === undefined
    ? initialMinimum
    : Math.max(
        1,
        Math.ceil(highWaterRowCount * VOICE_MIN_COVERAGE_RATIO),
      );
}

function parseVoiceCoverageHighWater(value: unknown): VoiceCoverageHighWater {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  const highWater: VoiceCoverageHighWater = {};
  for (const origin of ["aa_api", "aa_public_page"] as const) {
    const rowCount = record[origin];
    if (
      typeof rowCount === "number" &&
      Number.isFinite(rowCount) &&
      rowCount > 0
    ) {
      highWater[origin] = Math.floor(rowCount);
    }
  }
  return highWater;
}

function isLiveVoiceOrigin(value: unknown): value is LiveVoiceOrigin {
  return value === "aa_api" || value === "aa_public_page";
}

function validLiveVoiceModels(
  models: ArtificialAnalysisSpeechToSpeechModel[],
  minimumRowCount: number,
): boolean {
  const requiredCompleteRows = Math.ceil(models.length / 2);
  const completeRows = models.filter(
    (model) =>
      (model.s2sQualityIndex ?? 0) > 0 &&
      ((model.costPerHourOfInputAudio ?? 0) > 0 ||
        (model.pricePerHourInput ?? 0) > 0) &&
      (model.pricePerHourOutput ?? 0) > 0,
  ).length;
  return (
    models.length >= minimumRowCount &&
    completeRows >= requiredCompleteRows
  );
}

function applyCurrentVoiceFallbackAge(catalog: Catalog): Catalog {
  const voice = catalog.sourceStatus?.voice;
  if (
    !voice ||
    voice.state !== "fallback_fresh" ||
    (voice.origin !== "kv_last_known_good" &&
      voice.origin !== "bundled_snapshot") ||
    !voice.fetchedAt
  ) {
    return catalog;
  }

  const currentStatus = fallbackVoiceStatus(
    voice.origin,
    voice.fetchedAt,
    voice.rowCount,
  );
  if (currentStatus.state !== "fallback_stale") return catalog;

  const benchmarkCandidates = catalog.benchmarkCandidates?.map((candidate) =>
    candidate.benchmarks.voice
      ? {
          ...candidate,
          recommendable: false,
          benchmarks: {
            ...candidate.benchmarks,
            voice: { ...candidate.benchmarks.voice, stale: true },
          },
        }
      : candidate,
  );
  const models = catalog.models.map((model) =>
    model.benchmarks?.voice
      ? {
          ...model,
          benchmarks: {
            ...model.benchmarks,
            voice: { ...model.benchmarks.voice, stale: true },
          },
        }
      : model,
  );

  return {
    ...catalog,
    ...(benchmarkCandidates ? { benchmarkCandidates } : {}),
    models,
    sourceStatus: {
      ...catalog.sourceStatus,
      voice: currentStatus,
    },
  };
}

function fallbackVoiceStatus(
  origin: "kv_last_known_good" | "bundled_snapshot",
  fetchedAt: string,
  rowCount: number,
): VoiceSourceStatus {
  const timestamp = Date.parse(fetchedAt);
  const fresh =
    Number.isFinite(timestamp) &&
    Date.now() - timestamp <= VOICE_FALLBACK_MAX_AGE_MS;
  return {
    state: fresh ? "fallback_fresh" : "fallback_stale",
    origin,
    fetchedAt,
    rowCount,
  };
}

export async function fetchUsdAudRate(
  env: Env,
): Promise<ExchangeRate | undefined> {
  const response = await fetch(env.FX_RATE_URL || DEFAULT_FX_RATE_URL, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    return undefined;
  }

  const data = (await response.json()) as {
    base?: unknown;
    date?: unknown;
    rates?: { AUD?: unknown };
  };
  const rate = data.rates?.AUD;

  if (
    data.base !== "USD" ||
    typeof rate !== "number" ||
    !Number.isFinite(rate)
  ) {
    return undefined;
  }

  return {
    base: "USD",
    quote: "AUD",
    rate,
    ...(typeof data.date === "string" ? { date: data.date } : {}),
    source: env.FX_RATE_URL || DEFAULT_FX_RATE_URL,
  };
}

function normalizeRoute(pathname: string): string {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/v1") return "/";
  if (path.startsWith("/v1/")) return path.slice(3) || "/";
  return path;
}

function htmlResponse(html: string): Response {
  return new Response(html, {
    headers: {
      ...commonHeaders(),
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}

function jsonResponse(
  body: unknown,
  status = 200,
  headers: HeadersInit = {},
): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...commonHeaders(),
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300",
      ...headers,
    },
  });
}

function optionsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      ...commonHeaders(),
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-max-age": "86400",
    },
  });
}

function commonHeaders(): Record<string, string> {
  return {
    "access-control-allow-origin": "*",
    "x-content-type-options": "nosniff",
  };
}
