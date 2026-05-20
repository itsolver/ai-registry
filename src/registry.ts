export const SUPPORTED_PROVIDERS = [
  "openai",
  "google",
  "xai",
  "anthropic",
] as const;

export const CAPABILITIES = [
  "vision",
  "pdf",
  "reasoning",
  "toolCalling",
  "structuredOutput",
] as const;

export const TIERS = ["fast", "balanced", "best"] as const;
export const USE_CASES = [
  "customer-support",
  "coding",
  "billing-routine",
  "billing-risky",
  "billing-incident",
  "voice",
] as const;
export const CARE_LEVELS = [
  "triage",
  "standard",
  "essential",
  "premium",
  "complex",
] as const;

const RECOMMENDABLE_PROVIDER_FAMILY_PREFIXES = {
  openai: ["gpt", "o"],
  google: ["gemini"],
  xai: ["grok"],
  anthropic: ["claude"],
} as const satisfies Record<ProviderId, readonly string[]>;

const NON_WORK_MODEL_PATTERNS = [
  "audio",
  "embedding",
  "image",
  "live",
  "moderation",
  "realtime",
  "speech",
  "transcribe",
  "tts",
  "video",
] as const;

export type ProviderId = (typeof SUPPORTED_PROVIDERS)[number];
export type Capability = (typeof CAPABILITIES)[number];
export type Tier = (typeof TIERS)[number];
export type UseCase = (typeof USE_CASES)[number];
export type CareLevel = (typeof CARE_LEVELS)[number];

export interface ModelPricing {
  inputPerMTok: number;
  outputPerMTok: number;
  cacheReadPerMTok?: number;
  cacheWritePerMTok?: number;
}

export interface ExchangeRate {
  base: "USD";
  quote: "AUD";
  rate: number;
  date?: string;
  source: string;
}

export interface RegistryModel {
  id: string;
  provider: ProviderId;
  name: string;
  family: string;
  contextWindow: number;
  outputLimit: number;
  pricing: ModelPricing;
  capabilities: Record<Capability, boolean>;
  modalities: {
    input: string[];
    output: string[];
  };
  releaseDate?: string;
  knowledgeCutoff?: string;
  openWeights: boolean;
  tier: Tier;
  deprecated: boolean;
  updatedAt: string;
}

export interface ProviderSummary {
  provider: ProviderId;
  total: number;
  active: number;
}

export interface Catalog {
  generatedAt: string;
  exchangeRate?: ExchangeRate;
  benchmarkSignals?: Record<string, BenchmarkSignals>;
  modelCount: number;
  activeModelCount: number;
  providers: ProviderSummary[];
  models: RegistryModel[];
}

export interface ModelFilters {
  provider?: ProviderId;
  unsupportedProvider?: boolean;
  tier?: Tier;
  useCase?: UseCase;
  careLevel?: CareLevel;
  capability?: Capability;
  maxInputCostPerMTok?: number;
  maxOutputCostPerMTok?: number;
  minContextWindow?: number;
  includeDeprecated?: boolean;
}

interface ModelsDevProvider {
  models?: Record<string, ModelsDevModel>;
}

interface ModelsDevModel {
  id?: unknown;
  name?: unknown;
  family?: unknown;
  attachment?: unknown;
  reasoning?: unknown;
  tool_call?: unknown;
  structured_output?: unknown;
  knowledge?: unknown;
  release_date?: unknown;
  last_updated?: unknown;
  modalities?: {
    input?: unknown;
    output?: unknown;
  };
  open_weights?: unknown;
  limit?: {
    context?: unknown;
    input?: unknown;
    output?: unknown;
  };
  cost?: {
    input?: unknown;
    output?: unknown;
    cache_read?: unknown;
    cache_write?: unknown;
  };
  status?: unknown;
}

type ModelsDevDocument = Record<string, ModelsDevProvider>;

export interface ArtificialAnalysisModel {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  model_creator?: {
    slug?: unknown;
    name?: unknown;
  };
  evaluations?: Record<string, unknown>;
  median_output_tokens_per_second?: unknown;
  median_time_to_first_token_seconds?: unknown;
  median_time_to_first_answer_token?: unknown;
}

export interface BenchmarkSignals {
  intelligence?: number;
  coding?: number;
  instructionFollowing?: number;
  terminalBench?: number;
  tauTelecom?: number;
  professional?: number;
  speed?: number;
  latency?: number;
}

export function parseFilters(params: URLSearchParams): ModelFilters {
  const providerParam = params.get("provider");
  const provider = asProvider(providerParam);
  const tier = asTier(params.get("tier"));
  const useCase = asUseCase(params.get("useCase"));
  const careLevel = asCareLevel(params.get("careLevel"));
  const capability = asCapability(params.get("capability"));
  const maxInputCostPerMTok =
    asFiniteNumber(params.get("maxInputCostPerMTok")) ??
    asFiniteNumber(params.get("maxCostPerMTok"));
  const maxOutputCostPerMTok = asFiniteNumber(params.get("maxOutputCostPerMTok"));
  const minContextWindow = asFiniteNumber(params.get("minContextWindow"));

  return {
    ...(provider ? { provider } : {}),
    ...(providerParam && !provider ? { unsupportedProvider: true } : {}),
    ...(tier ? { tier } : {}),
    ...(useCase ? { useCase } : {}),
    ...(careLevel ? { careLevel } : {}),
    ...(capability ? { capability } : {}),
    ...(maxInputCostPerMTok !== undefined ? { maxInputCostPerMTok } : {}),
    ...(maxOutputCostPerMTok !== undefined ? { maxOutputCostPerMTok } : {}),
    ...(minContextWindow !== undefined ? { minContextWindow } : {}),
    includeDeprecated: params.get("includeDeprecated") === "true",
  };
}

export function normalizeModelsDev(
  source: ModelsDevDocument,
  generatedAt = new Date().toISOString(),
  exchangeRate?: ExchangeRate,
  artificialAnalysisModels: ArtificialAnalysisModel[] = [],
): Catalog {
  const models: RegistryModel[] = [];

  for (const provider of SUPPORTED_PROVIDERS) {
    const rawProvider = source[provider];
    if (!rawProvider?.models) continue;

    for (const [modelKey, rawModel] of Object.entries(rawProvider.models)) {
      models.push(
        normalizeModel(provider, modelKey, rawModel, generatedAt, exchangeRate),
      );
    }
  }

  const tiered = assignTiers(models);
  const providers = buildProviderSummaries(tiered);
  const benchmarkSignals = buildBenchmarkSignals(tiered, artificialAnalysisModels);

  return {
    generatedAt,
    ...(exchangeRate ? { exchangeRate } : {}),
    ...(Object.keys(benchmarkSignals).length ? { benchmarkSignals } : {}),
    modelCount: tiered.length,
    activeModelCount: tiered.filter((model) => !model.deprecated).length,
    providers,
    models: tiered,
  };
}

export function filterModels(
  models: RegistryModel[],
  filters: ModelFilters,
): RegistryModel[] {
  return models.filter((model) => {
    if (filters.unsupportedProvider) return false;
    if (!filters.includeDeprecated && model.deprecated) return false;
    if (filters.provider && model.provider !== filters.provider) return false;
    if (filters.tier && model.tier !== filters.tier) return false;
    if (
      filters.capability &&
      model.capabilities[filters.capability] !== true
    ) {
      return false;
    }
    if (
      filters.maxInputCostPerMTok !== undefined &&
      model.pricing.inputPerMTok > filters.maxInputCostPerMTok
    ) {
      return false;
    }
    if (
      filters.maxOutputCostPerMTok !== undefined &&
      model.pricing.outputPerMTok > filters.maxOutputCostPerMTok
    ) {
      return false;
    }
    if (
      filters.minContextWindow !== undefined &&
      model.contextWindow < filters.minContextWindow
    ) {
      return false;
    }
    return true;
  });
}

export function recommendModel(
  catalog: Catalog,
  filters: ModelFilters,
): RegistryModel | undefined {
  const tier = filters.tier ?? "fast";
  const matches = filterModels(catalog.models, filters).filter(
    isRecommendationCandidate,
  );

  return [...matches].sort((left, right) =>
    compareRecommendations(left, right, tier, filters, catalog),
  )[0];
}

export function latestForProvider(
  catalog: Catalog,
  provider: ProviderId,
): RegistryModel | undefined {
  return catalog.models
    .filter((model) => model.provider === provider && !model.deprecated)
    .sort(compareNewest)[0];
}

export function isRecommendationCandidate(model: RegistryModel): boolean {
  const family = model.family.toLowerCase();
  const id = model.id.toLowerCase();
  const searchable = `${model.id} ${model.name} ${model.family}`.toLowerCase();

  return (
    !model.deprecated &&
    !model.openWeights &&
    model.modalities.input.includes("text") &&
    model.modalities.output.includes("text") &&
    model.pricing.inputPerMTok > 0 &&
    model.pricing.outputPerMTok > 0 &&
    RECOMMENDABLE_PROVIDER_FAMILY_PREFIXES[model.provider].some((prefix) =>
      family.startsWith(prefix),
    ) &&
    !NON_WORK_MODEL_PATTERNS.some((pattern) => searchable.includes(pattern)) &&
    !id.includes("embedding") &&
    model.outputLimit > 0
  );
}

export function asProvider(value: string | null): ProviderId | undefined {
  return SUPPORTED_PROVIDERS.find((provider) => provider === value);
}

function asCapability(value: string | null): Capability | undefined {
  return CAPABILITIES.find((capability) => capability === value);
}

function asTier(value: string | null): Tier | undefined {
  return TIERS.find((tier) => tier === value);
}

function asUseCase(value: string | null): UseCase | undefined {
  if (value === "support") return "customer-support";
  return USE_CASES.find((useCase) => useCase === value);
}

function asCareLevel(value: string | null): CareLevel | undefined {
  return CARE_LEVELS.find((careLevel) => careLevel === value);
}

function normalizeModel(
  provider: ProviderId,
  modelKey: string,
  raw: ModelsDevModel,
  generatedAt: string,
  exchangeRate?: ExchangeRate,
): RegistryModel {
  const inputModalities = asStringArray(raw.modalities?.input);
  const outputModalities = asStringArray(raw.modalities?.output);
  const updatedAt = dateToIso(raw.last_updated) ?? generatedAt;
  const pricing: ModelPricing = {
    inputPerMTok: numberValue(raw.cost?.input),
    outputPerMTok: numberValue(raw.cost?.output),
    ...optionalPrice("cacheReadPerMTok", raw.cost?.cache_read),
    ...optionalPrice("cacheWritePerMTok", raw.cost?.cache_write),
  };

  return {
    id: stringValue(raw.id, modelKey),
    provider,
    name: stringValue(raw.name, modelKey),
    family: stringValue(raw.family, "unknown"),
    contextWindow: numberValue(raw.limit?.context ?? raw.limit?.input),
    outputLimit: numberValue(raw.limit?.output),
    pricing: exchangeRate ? convertPricing(pricing, exchangeRate) : pricing,
    capabilities: {
      vision: inputModalities.includes("image"),
      pdf: Boolean(raw.attachment) || inputModalities.includes("pdf"),
      reasoning: Boolean(raw.reasoning),
      toolCalling: Boolean(raw.tool_call),
      structuredOutput: Boolean(raw.structured_output),
    },
    modalities: {
      input: inputModalities,
      output: outputModalities,
    },
    ...optionalString("releaseDate", raw.release_date),
    ...optionalString("knowledgeCutoff", raw.knowledge),
    openWeights: Boolean(raw.open_weights),
    tier: "fast",
    deprecated: raw.status === "deprecated",
    updatedAt,
  };
}

function assignTiers(models: RegistryModel[]): RegistryModel[] {
  const tiers = new Map<string, Tier>();

  for (const provider of SUPPORTED_PROVIDERS) {
    const candidates = models
      .filter((model) => model.provider === provider)
      .filter(isRecommendationCandidate)
      .sort(compareCheapest);

    const firstBreak = Math.ceil(candidates.length / 3);
    const secondBreak = Math.ceil((candidates.length * 2) / 3);

    candidates.forEach((model, index) => {
      let tier: Tier = "best";
      if (index < firstBreak) tier = "fast";
      else if (index < secondBreak) tier = "balanced";
      tiers.set(modelKey(model), tier);
    });
  }

  return models.map((model) => ({
    ...model,
    tier: tiers.get(modelKey(model)) ?? fallbackTier(model),
  }));
}

function buildProviderSummaries(models: RegistryModel[]): ProviderSummary[] {
  return SUPPORTED_PROVIDERS.map((provider) => {
    const providerModels = models.filter((model) => model.provider === provider);
    return {
      provider,
      total: providerModels.length,
      active: providerModels.filter((model) => !model.deprecated).length,
    };
  }).filter((summary) => summary.total > 0);
}

function buildBenchmarkSignals(
  models: RegistryModel[],
  artificialAnalysisModels: ArtificialAnalysisModel[],
): Record<string, BenchmarkSignals> {
  const matches = new Map<string, BenchmarkSignals>();

  for (const aaModel of artificialAnalysisModels) {
    const provider = providerFromArtificialAnalysis(aaModel);
    if (!provider) continue;

    const aaKeys = artificialAnalysisKeys(aaModel);
    const model = models.find(
      (candidate) =>
        candidate.provider === provider &&
        modelKeys(candidate).some((key) => aaKeys.has(key)),
    );
    if (!model) continue;

    matches.set(modelKey(model), benchmarkSignalsFromArtificialAnalysis(aaModel));
  }

  return Object.fromEntries(matches);
}

function providerFromArtificialAnalysis(
  model: ArtificialAnalysisModel,
): ProviderId | undefined {
  const slug = stringValue(model.model_creator?.slug, "").toLowerCase();
  const name = stringValue(model.model_creator?.name, "").toLowerCase();
  if (slug.includes("openai") || name.includes("openai")) return "openai";
  if (slug.includes("google") || name.includes("google")) return "google";
  if (slug.includes("xai") || name.includes("xai")) return "xai";
  if (slug.includes("anthropic") || name.includes("anthropic")) return "anthropic";
  return undefined;
}

function benchmarkSignalsFromArtificialAnalysis(
  model: ArtificialAnalysisModel,
): BenchmarkSignals {
  const evaluations = model.evaluations ?? {};
  return {
    ...optionalSignal(
      "intelligence",
      firstScore(evaluations, [
        "artificial_analysis_intelligence_index",
        "intelligence_index",
      ]),
    ),
    ...optionalSignal(
      "coding",
      firstScore(evaluations, [
        "artificial_analysis_coding_index",
        "coding_index",
        "livecodebench",
        "scicode",
      ]),
    ),
    ...optionalSignal(
      "instructionFollowing",
      firstScore(evaluations, ["ifbench", "if_bench", "ifeval", "ifeval_strict"]),
    ),
    ...optionalSignal(
      "terminalBench",
      firstScore(evaluations, [
        "terminalbench_hard",
        "terminal_bench_hard",
        "terminalbench",
        "terminal_bench",
      ]),
    ),
    ...optionalSignal(
      "tauTelecom",
      firstScore(evaluations, [
        "tau2_bench_telecom",
        "tau2_telecom",
        "tau2_bench",
        "tau_bench_telecom",
      ]),
    ),
    ...optionalSignal(
      "professional",
      firstScore(evaluations, ["gdpval", "gdpval_index", "professional_index"]),
    ),
    ...optionalSignal("speed", numberOrUndefined(model.median_output_tokens_per_second)),
    ...optionalSignal(
      "latency",
      numberOrUndefined(
        model.median_time_to_first_token_seconds ??
          model.median_time_to_first_answer_token,
      ),
    ),
  };
}

function firstScore(
  evaluations: Record<string, unknown>,
  keys: string[],
): number | undefined {
  for (const key of keys) {
    const value = normalizeBenchmarkScore(evaluations[key]);
    if (value !== undefined) return value;
  }
  return undefined;
}

function normalizeBenchmarkScore(value: unknown): number | undefined {
  const score = numberOrUndefined(value);
  if (score === undefined) return undefined;
  if (score <= 1) return score * 100;
  return score;
}

function optionalSignal<K extends keyof BenchmarkSignals>(
  key: K,
  value: number | undefined,
): Pick<BenchmarkSignals, K> | Record<string, never> {
  return value === undefined ? {} : ({ [key]: value } as Pick<BenchmarkSignals, K>);
}

function artificialAnalysisKeys(model: ArtificialAnalysisModel): Set<string> {
  return new Set(
    [model.id, model.name, model.slug]
      .filter((value): value is string => typeof value === "string")
      .map(normalizeMatchKey),
  );
}

function modelKeys(model: RegistryModel): string[] {
  return [model.id, model.name].map(normalizeMatchKey);
}

function normalizeMatchKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function compareForTier(
  left: RegistryModel,
  right: RegistryModel,
  tier: Tier,
): number {
  if (tier === "best") {
    return (
      compareNewest(left, right) ||
      right.contextWindow - left.contextWindow ||
      right.pricing.inputPerMTok - left.pricing.inputPerMTok ||
      left.id.localeCompare(right.id)
    );
  }

  if (tier === "balanced") {
    return (
      compareCheapest(left, right) ||
      right.contextWindow - left.contextWindow ||
      compareNewest(left, right) ||
      left.id.localeCompare(right.id)
    );
  }

  return compareCheapest(left, right) || left.id.localeCompare(right.id);
}

function compareRecommendations(
  left: RegistryModel,
  right: RegistryModel,
  tier: Tier,
  filters: ModelFilters,
  catalog: Catalog,
): number {
  if (!filters.useCase) {
    return compareForTier(left, right, tier);
  }

  return (
    scoreRecommendation(right, filters, catalog) -
      scoreRecommendation(left, filters, catalog) ||
    compareForTier(left, right, tier)
  );
}

function scoreRecommendation(
  model: RegistryModel,
  filters: ModelFilters,
  catalog: Catalog,
): number {
  const useCase = filters.useCase;
  if (!useCase) return 0;

  const careLevel = filters.careLevel ?? defaultCareLevel(useCase);
  const signals = catalog.benchmarkSignals?.[modelKey(model)];
  const quality = qualityScore(model, signals, useCase);
  const latency = latencyScore(signals);
  const speed = speedScore(signals);
  const context = contextScore(model);
  const cost = costScore(model, useCase);
  const weights = scoringWeights(useCase, careLevel);

  return (
    quality * weights.quality +
    latency * weights.latency +
    speed * weights.speed +
    context * weights.context +
    cost * weights.cost
  );
}

function defaultCareLevel(useCase: UseCase): CareLevel {
  if (useCase === "customer-support" || useCase === "voice") return "standard";
  if (useCase === "billing-routine") return "standard";
  if (useCase === "billing-incident") return "complex";
  return "premium";
}

function scoringWeights(
  useCase: UseCase,
  careLevel: CareLevel,
): { quality: number; latency: number; speed: number; context: number; cost: number } {
  if (useCase === "voice") {
    return { quality: 0.28, latency: 0.28, speed: 0.18, context: 0.04, cost: 0.22 };
  }

  if (useCase === "coding") {
    return { quality: 0.52, latency: 0.08, speed: 0.08, context: 0.12, cost: 0.2 };
  }

  if (useCase === "billing-routine") {
    return { quality: 0.34, latency: 0.08, speed: 0.06, context: 0.12, cost: 0.4 };
  }

  if (useCase === "billing-risky") {
    return { quality: 0.54, latency: 0.05, speed: 0.04, context: 0.18, cost: 0.19 };
  }

  if (useCase === "billing-incident") {
    return { quality: 0.62, latency: 0.08, speed: 0.04, context: 0.2, cost: 0.06 };
  }

  if (careLevel === "triage") {
    return { quality: 0.24, latency: 0.18, speed: 0.12, context: 0.06, cost: 0.4 };
  }

  if (careLevel === "premium" || careLevel === "complex") {
    return { quality: 0.52, latency: 0.14, speed: 0.08, context: 0.12, cost: 0.14 };
  }

  return { quality: 0.4, latency: 0.16, speed: 0.1, context: 0.08, cost: 0.26 };
}

function qualityScore(
  model: RegistryModel,
  signals: BenchmarkSignals | undefined,
  useCase: UseCase,
): number {
  const fallback = familyQualityFallback(model);
  if (!signals) return fallback;

  if (useCase === "coding") {
    return weightedAverage(
      [
        [signals.terminalBench, 0.35],
        [signals.coding, 0.35],
        [signals.instructionFollowing, 0.15],
        [signals.intelligence, 0.15],
      ],
      fallback,
    );
  }

  if (useCase === "customer-support" || useCase === "voice") {
    return weightedAverage(
      [
        [signals.tauTelecom, useCase === "voice" ? 0.35 : 0.25],
        [signals.instructionFollowing, 0.3],
        [signals.intelligence, 0.25],
        [signals.professional, 0.1],
      ],
      fallback,
    );
  }

  return weightedAverage(
    [
      [signals.instructionFollowing, 0.3],
      [signals.intelligence, 0.3],
      [signals.professional, 0.2],
      [signals.coding, 0.1],
      [signals.terminalBench, 0.1],
    ],
    fallback,
  );
}

function familyQualityFallback(model: RegistryModel): number {
  const family = model.family.toLowerCase();
  if (family.includes("opus") || family.includes("pro")) return 84;
  if (family.includes("sonnet") || family === "gpt" || family.includes("grok")) {
    return 78;
  }
  if (family.includes("mini") || family.includes("flash")) return 68;
  if (family.includes("haiku") || family.includes("nano")) return 58;
  return 62;
}

function latencyScore(signals: BenchmarkSignals | undefined): number {
  if (signals?.latency === undefined) return 50;
  return 100 - Math.min(signals.latency / 20, 1) * 100;
}

function speedScore(signals: BenchmarkSignals | undefined): number {
  if (signals?.speed === undefined) return 50;
  return Math.min(signals.speed / 220, 1) * 100;
}

function contextScore(model: RegistryModel): number {
  return Math.min(model.contextWindow / 1_000_000, 1) * 100;
}

function costScore(model: RegistryModel, useCase?: UseCase): number {
  const outputWeight =
    useCase === "customer-support" || useCase === "voice" ? 0.6 : 0.25;
  const inputWeight = 1 - outputWeight;
  const blended =
    model.pricing.inputPerMTok * inputWeight +
    model.pricing.outputPerMTok * outputWeight;
  return 100 - Math.min(Math.log1p(blended) / Math.log1p(100), 1) * 100;
}

function weightedAverage(
  values: Array<[number | undefined, number]>,
  fallback: number,
): number {
  let total = 0;
  let weight = 0;

  for (const [value, valueWeight] of values) {
    if (value === undefined) continue;
    total += value * valueWeight;
    weight += valueWeight;
  }

  return weight ? total / weight : fallback;
}

function compareCheapest(left: RegistryModel, right: RegistryModel): number {
  return (
    left.pricing.inputPerMTok - right.pricing.inputPerMTok ||
    left.pricing.outputPerMTok - right.pricing.outputPerMTok ||
    compareNewest(left, right)
  );
}

function compareNewest(left: RegistryModel, right: RegistryModel): number {
  return (
    dateValue(right.releaseDate) - dateValue(left.releaseDate) ||
    dateValue(right.updatedAt) - dateValue(left.updatedAt)
  );
}

function fallbackTier(model: RegistryModel): Tier {
  if (model.pricing.inputPerMTok <= 1) return "fast";
  if (model.pricing.inputPerMTok <= 5) return "balanced";
  return "best";
}

function modelKey(model: RegistryModel): string {
  return `${model.provider}:${model.id}`;
}

function asFiniteNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function optionalPrice(
  key: "cacheReadPerMTok" | "cacheWritePerMTok",
  value: unknown,
): Partial<ModelPricing> {
  return typeof value === "number" && Number.isFinite(value)
    ? { [key]: value }
    : {};
}

function convertPricing(
  pricing: ModelPricing,
  exchangeRate: ExchangeRate,
): ModelPricing {
  return {
    inputPerMTok: audValue(pricing.inputPerMTok, exchangeRate.rate),
    outputPerMTok: audValue(pricing.outputPerMTok, exchangeRate.rate),
    ...optionalAudPrice(
      "cacheReadPerMTok",
      pricing.cacheReadPerMTok,
      exchangeRate.rate,
    ),
    ...optionalAudPrice(
      "cacheWritePerMTok",
      pricing.cacheWritePerMTok,
      exchangeRate.rate,
    ),
  };
}

function optionalAudPrice(
  key: "cacheReadPerMTok" | "cacheWritePerMTok",
  value: number | undefined,
  rate: number,
): Partial<ModelPricing> {
  return value === undefined ? {} : { [key]: audValue(value, rate) };
}

function audValue(value: number, rate: number): number {
  return Number((value * rate).toFixed(6));
}

function optionalString<K extends "releaseDate" | "knowledgeCutoff">(
  key: K,
  value: unknown,
): Pick<RegistryModel, K> | Record<string, never> {
  return typeof value === "string" && value.trim()
    ? ({ [key]: value.trim() } as Pick<RegistryModel, K>)
    : {};
}

function dateToIso(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? `${trimmed}T00:00:00Z`
    : trimmed;
}

function dateValue(value: string | undefined): number {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}
