import type { ArtificialAnalysisSpeechToSpeechModel } from "./registry";

const SUPPORTED_PROVIDERS = new Set(["openai", "google", "xai", "anthropic"]);

export function parseArtificialAnalysisSpeechToSpeechPage(
  html: string,
): ArtificialAnalysisSpeechToSpeechModel[] {
  const decoded = html.replaceAll('\\"', '"');
  const records: unknown[] = [];
  let cursor = 0;

  while (cursor < decoded.length) {
    const start = decoded.indexOf('{"id":"', cursor);
    if (start < 0) break;
    const raw = balancedJsonObject(decoded, start);
    cursor = start + Math.max(raw?.length ?? 1, 1);
    if (!raw) continue;

    try {
      records.push(JSON.parse(raw));
    } catch {
      // The page contains unrelated serialized objects. Only complete objects
      // matching the speech-to-speech schema are accepted below.
    }
  }

  return normalizeArtificialAnalysisSpeechToSpeechRecords(records);
}

export function parseArtificialAnalysisSpeechToSpeechApi(
  value: unknown,
): ArtificialAnalysisSpeechToSpeechModel[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const data = (value as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];

  return normalizeArtificialAnalysisSpeechToSpeechRecords(
    data.flatMap(apiHostRecords),
  );
}

export function normalizeArtificialAnalysisSpeechToSpeechRecords(
  value: unknown,
): ArtificialAnalysisSpeechToSpeechModel[] {
  if (!Array.isArray(value)) return [];
  const bySlug = new Map<string, ArtificialAnalysisSpeechToSpeechModel>();

  for (const item of value) {
    const record = normalizeRecord(item);
    if (!record) continue;
    const existing = bySlug.get(record.slug);
    if (!existing || completeness(record) > completeness(existing)) {
      bySlug.set(record.slug, record);
    }
  }

  return [...bySlug.values()].sort(
    (left, right) =>
      left.provider.localeCompare(right.provider) ||
      left.slug.localeCompare(right.slug),
  );
}

function balancedJsonObject(value: string, start: number): string | undefined {
  let depth = 0;
  let quoted = false;
  let escaped = false;

  for (let index = start; index < value.length; index += 1) {
    const character = value[index];
    if (quoted) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        quoted = false;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0) return value.slice(start, index + 1);
    }
  }

  return undefined;
}

function normalizeRecord(
  value: unknown,
): ArtificialAnalysisSpeechToSpeechModel | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const host = objectOrUndefined(record.host);
  const model = objectOrUndefined(record.model);
  const categoryScores = objectOrUndefined(record.tauVoiceScoresByCategory);
  const provider =
    stringOrUndefined(record.provider) ?? stringOrUndefined(host?.slug);
  const slug = stringOrUndefined(record.slug);
  if (!provider || !slug || !SUPPORTED_PROVIDERS.has(provider)) return undefined;

  const name = stringOrUndefined(record.name) ?? slug;
  return {
    id: stringOrUndefined(record.id) ?? slug,
    name,
    shortName: stringOrUndefined(record.shortName) ?? name,
    slug,
    provider,
    providerName:
      stringOrUndefined(record.providerName) ??
      stringOrUndefined(host?.name) ??
      provider,
    modelSlug:
      stringOrUndefined(record.modelSlug) ??
      stringOrUndefined(model?.slug) ??
      slug,
    ...optionalNumber("s2sQualityIndex", record.s2sQualityIndex),
    ...optionalNumber("bbaScore", record.bbaScore),
    ...optionalNumber("tauVoiceAggScore", record.tauVoiceAggScore),
    ...optionalNumber(
      "tauVoiceTelecomScore",
      objectOrUndefined(categoryScores?.telecom)?.avg_reward,
    ),
    ...optionalNumber(
      "tauVoiceRetailScore",
      objectOrUndefined(categoryScores?.retail)?.avg_reward,
    ),
    ...optionalNumber(
      "tauVoiceAirlineScore",
      objectOrUndefined(categoryScores?.airline)?.avg_reward,
    ),
    ...optionalNumber("fdbScore", record.fdbScore),
    ...optionalNumber("timeToFirstAudioSeconds", record.timeToFirstAudioSeconds),
    ...optionalNumber("costPerHourOfInputAudio", record.costPerHourOfInputAudio),
    ...optionalNumber("pricePerHourInput", record.pricePerHourInput),
    ...optionalNumber("pricePerHourOutput", record.pricePerHourOutput),
    ...optionalNumber("averageCostPerTask", record.averageCostPerTask),
  };
}

function apiHostRecords(value: unknown): unknown[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const record = value as Record<string, unknown>;
  const providers = record.providers;

  // Keep accepting the host-shaped form used by fixtures and by any future
  // endpoint version that directly exposes the public host-model schema.
  if (!Array.isArray(providers)) return [record];

  const modelSlug = stringOrUndefined(record.slug);
  const modelName = stringOrUndefined(record.name);
  if (!modelSlug || !modelName) return [];

  const creator = objectOrUndefined(record.model_creator);
  const creatorName = stringOrUndefined(creator?.name);
  const bbaScore = numberOrUndefined(record.bba_score);
  const tauVoiceAggScore = numberOrUndefined(record.tau_voice_score);
  const fdbScore = numberOrUndefined(record.fdb_score);
  const qualityIndex =
    numberOrUndefined(record.s2s_quality_index) ??
    computedQualityIndex(bbaScore, tauVoiceAggScore, fdbScore);

  return providers.flatMap((providerValue) => {
    const provider = objectOrUndefined(providerValue);
    const providerSlug = stringOrUndefined(provider?.slug);
    const providerName = stringOrUndefined(provider?.name);
    if (!providerSlug || !providerName) return [];

    const hostedByCreator =
      creatorName !== undefined &&
      normalizedIdentity(providerName) === normalizedIdentity(creatorName);
    const slug =
      hostedByCreator || modelSlug.startsWith(`${providerSlug}-`)
        ? modelSlug
        : `${providerSlug}-${modelSlug}`;
    const providerId = stringOrUndefined(provider?.id);

    return [
      {
        id: providerId
          ? `${stringOrUndefined(record.id) ?? modelSlug}:${providerId}`
          : `${stringOrUndefined(record.id) ?? modelSlug}:${providerSlug}`,
        name: hostedByCreator ? modelName : `${modelName}, ${providerName}`,
        shortName: modelName,
        slug,
        provider: providerSlug,
        providerName,
        modelSlug,
        s2sQualityIndex: qualityIndex,
        bbaScore,
        tauVoiceAggScore,
        fdbScore,
        timeToFirstAudioSeconds: numberOrUndefined(
          provider?.time_to_first_audio_seconds,
        ),
        costPerHourOfInputAudio:
          numberOrUndefined(provider?.cost_per_hour_of_input_audio) ??
          numberOrUndefined(record.cost_per_hour_of_input_audio),
        pricePerHourInput: numberOrUndefined(provider?.price_per_hour_input),
        pricePerHourOutput: numberOrUndefined(provider?.price_per_hour_output),
        averageCostPerTask:
          numberOrUndefined(provider?.average_cost_per_task) ??
          numberOrUndefined(record.average_cost_per_task),
      },
    ];
  });
}

function computedQualityIndex(
  bbaScore: number | undefined,
  tauVoiceScore: number | undefined,
  fdbScore: number | undefined,
): number | undefined {
  if (
    bbaScore === undefined ||
    tauVoiceScore === undefined ||
    fdbScore === undefined
  ) {
    return undefined;
  }
  return ((bbaScore + tauVoiceScore + fdbScore) / 3) * 100;
}

function normalizedIdentity(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function completeness(model: ArtificialAnalysisSpeechToSpeechModel): number {
  return Object.values(model).filter((value) => value !== undefined).length;
}

function objectOrUndefined(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function optionalNumber<K extends keyof ArtificialAnalysisSpeechToSpeechModel>(
  key: K,
  value: unknown,
): Partial<ArtificialAnalysisSpeechToSpeechModel> {
  return typeof value === "number" && Number.isFinite(value)
    ? ({ [key]: value } as Partial<ArtificialAnalysisSpeechToSpeechModel>)
    : {};
}
