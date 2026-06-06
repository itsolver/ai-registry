import {
  AA_SPEECH_TO_SPEECH_EXTRACTED_AT,
  AA_SPEECH_TO_SPEECH_MODELS,
} from "./generated/aa-speech-to-speech";
import { AA_SPEECH_TO_TEXT_MODELS } from "./generated/aa-speech-to-text";
import { AA_CUSTOMER_SUPPORT_RECOMMENDATIONS } from "./generated/aa-customer-support-recommendations";
import { AA_LLM_EFFICIENCY_MODELS } from "./generated/aa-llm-efficiency";
import { AA_LLM_PRICING_MODELS } from "./generated/aa-llm-pricing";
import { AI_AUTOCLOSE_BENCHMARKS } from "./generated/ai-autoclose-benchmarks";

export const SUPPORTED_PROVIDERS = [
  "openai",
  "google",
  "xai",
  "anthropic",
  "nvidia",
  "elevenlabs",
  "groq",
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
  "voice",
  "speech-to-text",
] as const;

const RECOMMENDABLE_PROVIDER_FAMILY_PREFIXES = {
  openai: ["gpt", "o"],
  google: ["gemini"],
  xai: ["grok"],
  anthropic: ["claude"],
  nvidia: ["nvidia", "parakeet", "canary"],
  elevenlabs: ["elevenlabs", "scribe"],
  groq: ["groq", "whisper"],
} as const satisfies Record<ProviderId, readonly string[]>;

const PROVIDER_DISPLAY_NAMES = {
  openai: "OpenAI",
  google: "Google",
  xai: "xAI",
  anthropic: "Anthropic",
  nvidia: "NVIDIA",
  elevenlabs: "ElevenLabs",
  groq: "Groq",
} as const satisfies Record<ProviderId, string>;

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

const NEAR_RETIREMENT_DAYS = 90;
const MODEL_RETIREMENT_DATES = {
  "gemini-2-0-flash": "2026-06-01",
  "gemini-2-0-flash-lite": "2026-06-01",
} as const;

export type ProviderId = (typeof SUPPORTED_PROVIDERS)[number];
export type Capability = (typeof CAPABILITIES)[number];
export type Tier = (typeof TIERS)[number];
export type UseCase = (typeof USE_CASES)[number];

export interface ModelPricing {
  inputPerMTok?: number;
  outputPerMTok?: number;
  cacheReadPerMTok?: number;
  cacheWritePerMTok?: number;
  audioInputPerHour?: number;
  audioOutputPerHour?: number;
  benchmarkInputAudioPerHour?: number;
  benchmarkCostPerTask?: number;
  transcriptionCostPer1kMinutes?: number;
}

export interface VoiceBenchmarks {
  speechReasoning?: number;
  agenticPerformance?: number;
  telecomAgenticPerformance?: number;
  retailAgenticPerformance?: number;
  airlineAgenticPerformance?: number;
  conversationalDynamics?: number;
  timeToFirstAudioSeconds?: number;
  source: "artificialanalysis";
  extractedAt: string;
}

export interface SpeechToTextBenchmarks {
  aaWer?: number;
  agentTalkWer?: number;
  voxpopuliWer?: number;
  earnings22Wer?: number;
  speedFactor?: number;
  hostingProviderName?: string;
  hostingProviderSlug?: string;
  source: "artificialanalysis";
  extractedAt: string;
}

export type ModelAvailabilityStatus =
  | "production"
  | "deprecated"
  | "retired"
  | "preview"
  | "experimental"
  | "latest-alias"
  | "near-retirement"
  | "unknown";

export interface ModelAvailabilityMetadata {
  status: ModelAvailabilityStatus;
  acceptedRisk: boolean;
  reason: string;
  sourceUrl?: string;
  verifiedOn?: string;
}

export interface AutoCloseBenchmarkSignals {
  source: "itsolver-autoclose";
  modelKey: string;
  apiModel: string;
  displayName: string;
  benchmarkReport: string;
  resultsFile: string;
  generatedAt: string;
  benchmarkCodeSha: string;
  total: number;
  correctCount: number;
  accuracy: number;
  falsePositiveCount: number;
  falseNegativeCount: number;
  invalidCount: number;
  errorCount: number;
  parseSuccessRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  avgCostUsd?: number;
  costPer1000Usd?: number;
  costPer1000Aud?: number;
  costPer1000CorrectUsd?: number;
  weightedScore: number;
  sourceUrl: string;
  verifiedOn: string;
  officialSourceUrl?: string;
  officialVerifiedOn?: string;
  availability: ModelAvailabilityMetadata;
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
  benchmarks?: {
    voice?: VoiceBenchmarks;
    llm?: BenchmarkSignals;
    speechToText?: SpeechToTextBenchmarks;
  };
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
  benchmarkCandidates?: BenchmarkCandidate[];
  modelCount: number;
  activeModelCount: number;
  providers: ProviderSummary[];
  models: RegistryModel[];
}

export interface BenchmarkCandidate {
  id: string;
  provider: ProviderId;
  name: string;
  source: "artificialanalysis";
  benchmarks: {
    voice?: VoiceBenchmarks;
    llm?: BenchmarkSignals;
    speechToText?: SpeechToTextBenchmarks;
  };
  pricing: ModelPricing;
  registryModelId?: string;
  recommendable: boolean;
  availability?: ModelAvailabilityMetadata;
  family: string | null;
  contextWindow: number | null;
  outputLimit: number | null;
  capabilities: Record<Capability, boolean> | null;
  modalities: {
    input: string[];
    output: string[];
  } | null;
  releaseDate?: string;
  knowledgeCutoff?: string;
  openWeights: boolean | null;
  tier: Tier | null;
  deprecated: boolean | null;
  updatedAt: string | null;
}

export interface ModelFilters {
  provider?: ProviderId;
  unsupportedProvider?: boolean;
  tier?: Tier;
  useCase?: UseCase;
  capability?: Capability;
  minInputCostPerMTok?: number;
  maxInputCostPerMTok?: number;
  minOutputCostPerMTok?: number;
  maxOutputCostPerMTok?: number;
  minRunCostAud?: number;
  maxRunCostAud?: number;
  minRunCostUsd?: number;
  maxRunCostUsd?: number;
  minIntelligence?: number;
  maxAudioInputCostPerHour?: number;
  maxAudioOutputCostPerHour?: number;
  maxTranscriptionCostPer1kMinutes?: number;
  maxAaWer?: number;
  minContextWindow?: number;
  maxContextWindow?: number;
  includeItsBenchmark?: boolean;
  allowPreview?: boolean;
}

export type RecommendedModel = RegistryModel | BenchmarkCandidate;

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
  pricing?: unknown;
  prices?: unknown;
  price?: unknown;
  cost?: unknown;
  input_price?: unknown;
  output_price?: unknown;
  input_cost?: unknown;
  output_cost?: unknown;
  price_1m_input_tokens?: unknown;
  price_1m_output_tokens?: unknown;
  input_cost_per_million_tokens?: unknown;
  output_cost_per_million_tokens?: unknown;
}

export interface ArtificialAnalysisSpeechToTextModel {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  extractedAt?: unknown;
  model_creator?: {
    slug?: unknown;
    name?: unknown;
  };
  aa_wer_index?: unknown;
  aa_agenttalk?: unknown;
  voxpopuli_cleaned_aa?: unknown;
  earnings_22_cleaned_aa?: unknown;
  open_weights?: unknown;
  providers?: unknown;
}

export interface BenchmarkSignals {
  autoClose?: AutoCloseBenchmarkSignals;
  intelligence?: number;
  agentic?: number;
  coding?: number;
  instructionFollowing?: number;
  terminalBench?: number;
  tauTelecom?: number;
  professional?: number;
  lcr?: number;
  hle?: number;
  gpqa?: number;
  critpt?: number;
  omniscience?: number;
  speed?: number;
  latency?: number;
  intelligenceRunAnswerCost?: number;
  intelligenceRunReasoningCost?: number;
  intelligenceRunInputCost?: number;
  intelligenceRunTotalCost?: number;
  intelligenceRunAnswerTokens?: number;
  intelligenceRunReasoningTokens?: number;
  intelligenceRunOutputTokens?: number;
  customerSupportRank?: number;
}

interface ArtificialAnalysisSpeechToSpeechModel {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  provider: string;
  providerName: string;
  modelSlug: string;
  bbaScore?: number;
  tauVoiceAggScore?: number;
  tauVoiceTelecomScore?: number;
  tauVoiceRetailScore?: number;
  tauVoiceAirlineScore?: number;
  fdbScore?: number;
  timeToFirstAudioSeconds?: number;
  costPerHourOfInputAudio?: number;
  pricePerHourInput?: number;
  pricePerHourOutput?: number;
  averageCostPerTask?: number;
}

interface ArtificialAnalysisLlmEfficiencyModel {
  label: string;
  slug: string;
  detailsUrl: string;
  provider?: string;
  contextWindowTokens?: number;
  intelligenceIndex?: number;
  agenticIndex?: number;
  ifbench?: number;
  tau2?: number;
  gdpval?: number;
  gdpvalNormalized?: number;
  terminalBenchHard?: number;
  sciCode?: number;
  codingIndex?: number;
  lcr?: number;
  hle?: number;
  gpqa?: number;
  critpt?: number;
  omniscienceIndex?: number;
  outputSpeed?: number;
  latency?: number;
  cacheHitPrice?: number;
  inputPrice?: number;
  outputPrice?: number;
  intelligenceRunAnswerCost?: number;
  intelligenceRunReasoningCost?: number;
  intelligenceRunInputCost?: number;
  intelligenceRunTotalCost?: number;
  intelligenceRunAnswerTokens?: number;
  intelligenceRunReasoningTokens?: number;
  intelligenceRunOutputTokens?: number;
}

interface ArtificialAnalysisLlmPricingModel {
  label: string;
  slug: string;
  detailsUrl: string;
  cacheHitPrice?: number;
  inputPrice: number;
  outputPrice: number;
}

interface ArtificialAnalysisCustomerSupportRecommendation {
  rank: number;
  label: string;
  slug: string;
  detailsUrl: string;
  provider: ProviderId;
  intelligenceIndex?: number;
  agenticScore?: number;
  instructionFollowingScore?: number;
  medianOutputSpeed?: number;
  intelligenceIndexCost?: number;
  inputPrice: number;
  outputPrice: number;
  cacheHitPrice?: number;
  contextWindow?: number;
  imageInput: boolean;
  reasoning: boolean;
}

interface ArtificialAnalysisSpeechToTextProvider {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  price_per_1k_minutes?: unknown;
  median_speed_factor?: unknown;
  aa_wer_index?: unknown;
  aa_agenttalk?: unknown;
  voxpopuli_cleaned_aa?: unknown;
  earnings_22_cleaned_aa?: unknown;
}

interface AiAutoCloseBenchmarkModel {
  id: string;
  provider: ProviderId;
  modelKey: string;
  apiModel: string;
  displayName: string;
  benchmarkReport: string;
  resultsFile: string;
  generatedAt: string;
  benchmarkCodeSha: string;
  total: number;
  correctCount: number;
  accuracy: number;
  falsePositiveCount: number;
  falseNegativeCount: number;
  invalidCount: number;
  errorCount: number;
  parseSuccessRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  avgCostUsd?: number;
  costPer1000Usd?: number;
  costPer1000CorrectUsd?: number;
  weightedScore: number;
  sourceUrl: string;
  verifiedOn: string;
  officialSourceUrl?: string;
  officialVerifiedOn?: string;
  availability: {
    status: ModelAvailabilityStatus;
    acceptedRisk: boolean;
    reason: string;
  };
}

export function parseFilters(params: URLSearchParams): ModelFilters {
  const providerParam = params.get("provider");
  const provider = asProvider(providerParam);
  const tier = asTier(params.get("tier"));
  const useCaseParam = params.get("useCase");
  const useCase = asUseCase(useCaseParam);
  const capability = asCapability(params.get("capability"));
  const minInputCostPerMTok =
    asFiniteNumber(params.get("minInputCostPerMTok")) ??
    asFiniteNumber(params.get("minCostPerMTok"));
  const maxInputCostPerMTok =
    asFiniteNumber(params.get("maxInputCostPerMTok")) ??
    asFiniteNumber(params.get("maxCostPerMTok"));
  const minOutputCostPerMTok = asFiniteNumber(
    params.get("minOutputCostPerMTok"),
  );
  const maxOutputCostPerMTok = asFiniteNumber(
    params.get("maxOutputCostPerMTok"),
  );
  const minRunCostAud =
    asFiniteNumber(params.get("minRunCostAud")) ??
    asFiniteNumber(params.get("minRunAud")) ??
    asFiniteNumber(params.get("minBenchmarkRunCostAud"));
  const maxRunCostAud =
    asFiniteNumber(params.get("maxRunCostAud")) ??
    asFiniteNumber(params.get("maxRunAud")) ??
    asFiniteNumber(params.get("maxBenchmarkRunCostAud"));
  const minRunCostUsd =
    asFiniteNumber(params.get("minRunCostUsd")) ??
    asFiniteNumber(params.get("minRunUsd")) ??
    asFiniteNumber(params.get("minBenchmarkRunCostUsd"));
  const maxRunCostUsd =
    asFiniteNumber(params.get("maxRunCostUsd")) ??
    asFiniteNumber(params.get("maxRunUsd")) ??
    asFiniteNumber(params.get("maxBenchmarkRunCostUsd"));
  const minIntelligence = asFiniteNumber(params.get("minIntelligence"));
  const maxAudioInputCostPerHour =
    asFiniteNumber(params.get("maxAudioInputCostPerHour")) ??
    asFiniteNumber(params.get("maxAudioCostPerHour"));
  const maxAudioOutputCostPerHour = asFiniteNumber(
    params.get("maxAudioOutputCostPerHour"),
  );
  const maxTranscriptionCostPer1kMinutes = asFiniteNumber(
    params.get("maxTranscriptionCostPer1kMinutes"),
  );
  const maxAaWer = asFiniteNumber(params.get("maxAaWer"));
  const minContextWindow = asFiniteNumber(params.get("minContextWindow"));
  const maxContextWindow = asFiniteNumber(params.get("maxContextWindow"));

  return {
    ...(provider ? { provider } : {}),
    ...(providerParam && !provider ? { unsupportedProvider: true } : {}),
    ...(tier ? { tier } : {}),
    ...(useCase ? { useCase } : {}),
    ...(capability ? { capability } : {}),
    ...(minInputCostPerMTok !== undefined ? { minInputCostPerMTok } : {}),
    ...(maxInputCostPerMTok !== undefined ? { maxInputCostPerMTok } : {}),
    ...(minOutputCostPerMTok !== undefined ? { minOutputCostPerMTok } : {}),
    ...(maxOutputCostPerMTok !== undefined ? { maxOutputCostPerMTok } : {}),
    ...(minRunCostAud !== undefined ? { minRunCostAud } : {}),
    ...(maxRunCostAud !== undefined ? { maxRunCostAud } : {}),
    ...(minRunCostUsd !== undefined ? { minRunCostUsd } : {}),
    ...(maxRunCostUsd !== undefined ? { maxRunCostUsd } : {}),
    ...(minIntelligence !== undefined ? { minIntelligence } : {}),
    ...(maxAudioInputCostPerHour !== undefined
      ? { maxAudioInputCostPerHour }
      : {}),
    ...(maxAudioOutputCostPerHour !== undefined
      ? { maxAudioOutputCostPerHour }
      : {}),
    ...(maxTranscriptionCostPer1kMinutes !== undefined
      ? { maxTranscriptionCostPer1kMinutes }
      : {}),
    ...(maxAaWer !== undefined ? { maxAaWer } : {}),
    ...(minContextWindow !== undefined ? { minContextWindow } : {}),
    ...(maxContextWindow !== undefined ? { maxContextWindow } : {}),
    includeItsBenchmark:
      params.get("includeItsBenchmark") !== "false" &&
      params.get("includeITSBenchmark") !== "false",
    allowPreview: params.get("allowPreview") === "true",
  };
}

export function normalizeArtificialAnalysisCatalog(
  generatedAt = new Date().toISOString(),
  exchangeRate?: ExchangeRate,
  artificialAnalysisModels: ArtificialAnalysisModel[] = [],
  artificialAnalysisSpeechToTextModels: ArtificialAnalysisSpeechToTextModel[] = [],
): Catalog {
  const voiceModels = normalizeSpeechToSpeechModels(exchangeRate);
  const speechToTextModels = [
    ...(AA_SPEECH_TO_TEXT_MODELS as readonly ArtificialAnalysisSpeechToTextModel[]),
    ...artificialAnalysisSpeechToTextModels,
  ];
  const benchmarkCandidates = buildBenchmarkCandidates(
    voiceModels,
    artificialAnalysisModels,
    speechToTextModels,
    exchangeRate,
    generatedAt,
  );
  const benchmarkSignals = Object.fromEntries(
    benchmarkCandidates
      .filter((candidate) => candidate.benchmarks.llm)
      .map((candidate) => [
        `${candidate.provider}:${candidate.id}`,
        candidate.benchmarks.llm!,
      ]),
  );
  const providers = buildBenchmarkProviderSummaries(benchmarkCandidates);

  return {
    generatedAt,
    ...(exchangeRate ? { exchangeRate } : {}),
    ...(Object.keys(benchmarkSignals).length ? { benchmarkSignals } : {}),
    ...(benchmarkCandidates.length ? { benchmarkCandidates } : {}),
    modelCount: benchmarkCandidates.length,
    activeModelCount: benchmarkCandidates.filter(
      (candidate) => candidate.recommendable,
    ).length,
    providers,
    models: [],
  };
}

export function filterModels(
  models: RegistryModel[],
  filters: ModelFilters,
): RegistryModel[] {
  return models.filter((model) => {
    if (filters.unsupportedProvider) return false;
    if (model.deprecated) return false;
    if (filters.provider && model.provider !== filters.provider) return false;
    if (filters.useCase === "voice" && !isVoiceModel(model)) return false;
    if (filters.useCase === "speech-to-text" && !isSpeechToTextModel(model)) {
      return false;
    }
    if (filters.tier && model.tier !== filters.tier) return false;
    if (filters.capability && model.capabilities[filters.capability] !== true) {
      return false;
    }
    if (
      filters.minInputCostPerMTok !== undefined &&
      (model.pricing.inputPerMTok === undefined ||
        model.pricing.inputPerMTok < filters.minInputCostPerMTok)
    ) {
      return false;
    }
    if (
      filters.maxInputCostPerMTok !== undefined &&
      (model.pricing.inputPerMTok === undefined ||
        model.pricing.inputPerMTok > filters.maxInputCostPerMTok)
    ) {
      return false;
    }
    if (
      filters.minOutputCostPerMTok !== undefined &&
      (model.pricing.outputPerMTok === undefined ||
        model.pricing.outputPerMTok < filters.minOutputCostPerMTok)
    ) {
      return false;
    }
    if (
      filters.maxOutputCostPerMTok !== undefined &&
      (model.pricing.outputPerMTok === undefined ||
        model.pricing.outputPerMTok > filters.maxOutputCostPerMTok)
    ) {
      return false;
    }
    if (
      filters.minIntelligence !== undefined &&
      (model.benchmarks?.llm?.intelligence === undefined ||
        model.benchmarks.llm.intelligence < filters.minIntelligence)
    ) {
      return false;
    }
    if (
      filters.maxAudioInputCostPerHour !== undefined &&
      (audioInputCost(model) === undefined ||
        audioInputCost(model)! > filters.maxAudioInputCostPerHour)
    ) {
      return false;
    }
    if (
      filters.maxAudioOutputCostPerHour !== undefined &&
      (audioOutputCost(model) === undefined ||
        audioOutputCost(model)! > filters.maxAudioOutputCostPerHour)
    ) {
      return false;
    }
    if (
      filters.maxTranscriptionCostPer1kMinutes !== undefined &&
      (transcriptionCost(model) === undefined ||
        transcriptionCost(model)! > filters.maxTranscriptionCostPer1kMinutes)
    ) {
      return false;
    }
    if (
      filters.maxAaWer !== undefined &&
      (model.benchmarks?.speechToText?.aaWer === undefined ||
        model.benchmarks.speechToText.aaWer > filters.maxAaWer)
    ) {
      return false;
    }
    if (
      filters.minContextWindow !== undefined &&
      model.contextWindow < filters.minContextWindow
    ) {
      return false;
    }
    if (
      filters.maxContextWindow !== undefined &&
      model.contextWindow > filters.maxContextWindow
    ) {
      return false;
    }
    return true;
  });
}

export function recommendModel(
  catalog: Catalog,
  filters: ModelFilters,
): RecommendedModel | undefined {
  return rankedRecommendedModels(catalog, filters)[0];
}

export function rankedRecommendedModels(
  catalog: Catalog,
  filters: ModelFilters,
): RecommendedModel[] {
  if (filters.useCase) {
    return rankedBenchmarkRecommendations(catalog, filters);
  }

  const tier = recommendationTier(filters);
  const matches = filterModels(catalog.models, filters).filter((model) =>
    isRecommendationCandidate(model),
  );

  return [...matches].sort((left, right) =>
    compareRecommendations(left, right, tier, filters, catalog),
  );
}

export function recommendModelFailovers(
  catalog: Catalog,
  filters: ModelFilters,
  limit = 2,
): BenchmarkCandidate[] {
  if (filters.useCase !== "customer-support" || limit <= 0) return [];

  const recommendation = recommendModel(catalog, filters);
  return rankedBenchmarkRecommendations(catalog, {
    ...filters,
    includeItsBenchmark: true,
  })
    .filter((candidate) => candidate.id !== recommendation?.id)
    .filter((candidate) => Boolean(candidate.benchmarks.llm?.autoClose))
    .slice(0, limit);
}

export function benchmarkCandidates(
  catalog: Catalog,
  filters: ModelFilters,
): BenchmarkCandidate[] {
  const effectiveFilters = filtersWithUsdRunCost(catalog, filters);
  const useCase = effectiveFilters.useCase;

  return (catalog.benchmarkCandidates ?? []).filter((candidate) => {
    if (effectiveFilters.unsupportedProvider) return false;
    if (isDeprecatedBenchmarkCandidate(candidate)) return false;
    if (
      effectiveFilters.provider &&
      candidate.provider !== effectiveFilters.provider
    ) {
      return false;
    }
    if (
      effectiveFilters.capability &&
      candidate.capabilities?.[effectiveFilters.capability] !== true
    ) {
      return false;
    }
    if (useCase && !candidate.benchmarks[benchmarkKeyForUseCase(useCase)]) {
      return false;
    }
    if (
      useCase === "customer-support" &&
      !hasCustomerSupportBenchmarkSignals(candidate.benchmarks.llm)
    ) {
      return false;
    }
    return passesCostFilters(candidate, effectiveFilters);
  });
}

export function isBenchmarkCandidateRecommendedForFilters(
  candidate: BenchmarkCandidate,
  filters: ModelFilters,
): boolean {
  return (
    hasRecommendableBenchmarkBasics(candidate) &&
    isUseCaseRecommendationCandidate(candidate, filters)
  );
}

function recommendBenchmarkCandidate(
  catalog: Catalog,
  filters: ModelFilters,
): BenchmarkCandidate | undefined {
  return rankedBenchmarkRecommendations(catalog, filters)[0];
}

function rankedBenchmarkRecommendations(
  catalog: Catalog,
  filters: ModelFilters,
): BenchmarkCandidate[] {
  const effectiveFilters = filtersWithUsdRunCost(catalog, filters);
  const tier = recommendationTier(filters);
  const matches = benchmarkCandidates(catalog, effectiveFilters).filter(
    (candidate) =>
      isBenchmarkCandidateRecommendedForFilters(candidate, effectiveFilters),
  );

  if (effectiveFilters.useCase === "speech-to-text" && tier === "balanced") {
    return rankBalancedSpeechToTextCandidates(matches);
  }

  if (effectiveFilters.useCase === "voice" && tier === "balanced") {
    return rankBalancedVoiceCandidates(matches);
  }

  if (effectiveFilters.useCase === "customer-support" && tier === "balanced") {
    return rankBalancedCustomerSupportCandidates(matches, effectiveFilters);
  }

  return [...matches].sort((left, right) =>
    compareBenchmarkCandidates(left, right, tier, effectiveFilters),
  );
}

function rankBalancedSpeechToTextCandidates(
  matches: BenchmarkCandidate[],
): BenchmarkCandidate[] {
  const accuracyOrdered = [...matches].sort((left, right) =>
    compareSpeechToTextBenchmarkCandidates(left, right, "best"),
  );
  return moveMiddleCandidateFirst(accuracyOrdered);
}

function rankBalancedVoiceCandidates(
  matches: BenchmarkCandidate[],
): BenchmarkCandidate[] {
  const qualityOrdered = [...matches].sort(compareVoiceQualityOrder);
  return moveMiddleCandidateFirst(qualityOrdered);
}

function rankBalancedCustomerSupportCandidates(
  matches: BenchmarkCandidate[],
  filters: ModelFilters,
): BenchmarkCandidate[] {
  if (filters.includeItsBenchmark === false) {
    const aaSupportOrdered = [...matches].sort(
      compareCustomerSupportAaSupportOrder,
    );
    return moveMiddleCandidateFirst(aaSupportOrdered);
  }

  const safetyOrdered = [...matches].sort((left, right) =>
    compareCustomerSupportSafetyOrder(left, right, filters),
  );
  return moveMiddleCandidateFirst(safetyOrdered);
}

function moveMiddleCandidateFirst(
  matches: BenchmarkCandidate[],
): BenchmarkCandidate[] {
  if (!matches.length) return [];
  const middleIndex = Math.floor((matches.length - 1) / 2);
  return [
    matches[middleIndex],
    ...matches.slice(0, middleIndex),
    ...matches.slice(middleIndex + 1),
  ];
}

function isUseCaseRecommendationCandidate(
  candidate: BenchmarkCandidate,
  filters: ModelFilters,
): boolean {
  if (filters.useCase !== "customer-support") return true;
  if (isDeprecatedBenchmarkCandidate(candidate)) return false;

  const signals = candidate.benchmarks.llm;
  if (filters.includeItsBenchmark !== false && !signals?.autoClose)
    return false;
  if (
    filters.includeItsBenchmark === false &&
    (candidate.capabilities?.vision !== true ||
      candidate.capabilities?.reasoning !== true)
  ) {
    return false;
  }

  return isProductionAvailabilityAllowed(
    candidate.availability ??
      productionAvailabilityForTextModel(candidate.id, candidate.name, signals),
    filters,
  );
}

function filtersWithUsdRunCost(
  catalog: Catalog,
  filters: ModelFilters,
): ModelFilters {
  const rate = catalog.exchangeRate?.rate ?? 1;
  const minRunCostUsdAud =
    filters.minRunCostUsd === undefined
      ? undefined
      : filters.minRunCostUsd * rate;
  const maxRunCostUsdAud =
    filters.maxRunCostUsd === undefined
      ? undefined
      : filters.maxRunCostUsd * rate;
  const minRunCostAud = maxDefined(filters.minRunCostAud, minRunCostUsdAud);
  const maxRunCostAud = minDefined(filters.maxRunCostAud, maxRunCostUsdAud);

  return {
    ...filters,
    ...(minRunCostAud !== undefined ? { minRunCostAud } : {}),
    ...(maxRunCostAud !== undefined ? { maxRunCostAud } : {}),
  };
}

function passesCostFilters(
  candidate: BenchmarkCandidate,
  filters: ModelFilters,
): boolean {
  if (
    filters.minInputCostPerMTok !== undefined &&
    (candidate.pricing.inputPerMTok === undefined ||
      candidate.pricing.inputPerMTok < filters.minInputCostPerMTok)
  ) {
    return false;
  }
  if (
    filters.maxInputCostPerMTok !== undefined &&
    (candidate.pricing.inputPerMTok === undefined ||
      candidate.pricing.inputPerMTok > filters.maxInputCostPerMTok)
  ) {
    return false;
  }
  if (
    filters.minOutputCostPerMTok !== undefined &&
    (candidate.pricing.outputPerMTok === undefined ||
      candidate.pricing.outputPerMTok < filters.minOutputCostPerMTok)
  ) {
    return false;
  }
  if (
    filters.maxOutputCostPerMTok !== undefined &&
    (candidate.pricing.outputPerMTok === undefined ||
      candidate.pricing.outputPerMTok > filters.maxOutputCostPerMTok)
  ) {
    return false;
  }
  if (
    filters.minRunCostAud !== undefined &&
    (candidate.benchmarks.llm?.intelligenceRunTotalCost === undefined ||
      candidate.benchmarks.llm.intelligenceRunTotalCost < filters.minRunCostAud)
  ) {
    return false;
  }
  if (
    filters.maxRunCostAud !== undefined &&
    (candidate.benchmarks.llm?.intelligenceRunTotalCost === undefined ||
      candidate.benchmarks.llm.intelligenceRunTotalCost > filters.maxRunCostAud)
  ) {
    return false;
  }
  if (
    filters.minIntelligence !== undefined &&
    (candidate.benchmarks.llm?.intelligence === undefined ||
      candidate.benchmarks.llm.intelligence < filters.minIntelligence)
  ) {
    return false;
  }
  if (
    filters.maxAudioInputCostPerHour !== undefined &&
    (candidate.pricing.benchmarkInputAudioPerHour === undefined ||
      candidate.pricing.benchmarkInputAudioPerHour >
        filters.maxAudioInputCostPerHour)
  ) {
    return false;
  }
  if (
    filters.maxAudioOutputCostPerHour !== undefined &&
    (candidateAudioOutputCost(candidate) === undefined ||
      candidateAudioOutputCost(candidate)! > filters.maxAudioOutputCostPerHour)
  ) {
    return false;
  }
  if (
    filters.maxTranscriptionCostPer1kMinutes !== undefined &&
    (candidateTranscriptionCost(candidate) === undefined ||
      candidateTranscriptionCost(candidate)! >
        filters.maxTranscriptionCostPer1kMinutes)
  ) {
    return false;
  }
  if (
    filters.maxAaWer !== undefined &&
    (candidate.benchmarks.speechToText?.aaWer === undefined ||
      candidate.benchmarks.speechToText.aaWer > filters.maxAaWer)
  ) {
    return false;
  }
  if (
    filters.minContextWindow !== undefined &&
    (candidate.contextWindow === null ||
      candidate.contextWindow < filters.minContextWindow)
  ) {
    return false;
  }
  if (
    filters.maxContextWindow !== undefined &&
    (candidate.contextWindow === null ||
      candidate.contextWindow > filters.maxContextWindow)
  ) {
    return false;
  }
  return true;
}

function recommendationTier(filters: ModelFilters): Tier {
  if (filters.tier) return filters.tier;
  return "fast";
}

export function latestForProvider(
  catalog: Catalog,
  provider: ProviderId,
): RegistryModel | undefined {
  return catalog.models
    .filter((model) => model.provider === provider && !model.deprecated)
    .sort(compareNewest)[0];
}

export function isRecommendationCandidate(
  model: RegistryModel,
  useCase?: UseCase,
): boolean {
  const id = model.id.toLowerCase();
  const searchable = `${model.id} ${model.name} ${model.family}`.toLowerCase();

  if (useCase === "voice") {
    return isVoiceModel(model);
  }

  return (
    !model.deprecated &&
    !model.openWeights &&
    model.modalities.input.includes("text") &&
    model.modalities.output.includes("text") &&
    model.pricing.inputPerMTok !== undefined &&
    model.pricing.inputPerMTok > 0 &&
    model.pricing.outputPerMTok !== undefined &&
    model.pricing.outputPerMTok > 0 &&
    providerFamilyAllowed(model) &&
    !NON_WORK_MODEL_PATTERNS.some((pattern) => searchable.includes(pattern)) &&
    !id.includes("embedding") &&
    model.outputLimit > 0
  );
}

function useCaseQualitySignals(
  signals: BenchmarkSignals,
  useCase: UseCase,
): Array<number | undefined> {
  if (useCase === "customer-support") {
    return [
      signals.instructionFollowing,
      signals.tauTelecom,
      signals.intelligence,
      signals.professional,
    ];
  }

  return [];
}

function isVoiceModel(model: RegistryModel): boolean {
  return (
    !model.deprecated &&
    !model.openWeights &&
    model.modalities.input.includes("audio") &&
    model.modalities.output.includes("audio") &&
    model.pricing.benchmarkInputAudioPerHour !== undefined &&
    model.pricing.benchmarkInputAudioPerHour > 0 &&
    hasPositiveAudioPrice(model) &&
    providerFamilyAllowed(model)
  );
}

function isSpeechToTextModel(model: RegistryModel): boolean {
  return (
    !model.deprecated &&
    !model.openWeights &&
    model.modalities.input.includes("audio") &&
    model.modalities.output.includes("text") &&
    isNumber(model.benchmarks?.speechToText?.aaWer) &&
    model.pricing.transcriptionCostPer1kMinutes !== undefined &&
    model.pricing.transcriptionCostPer1kMinutes > 0
  );
}

function benchmarkKeyForUseCase(
  useCase: UseCase,
): keyof BenchmarkCandidate["benchmarks"] {
  if (useCase === "voice") return "voice";
  if (useCase === "speech-to-text") return "speechToText";
  return "llm";
}

function providerFamilyAllowed(model: RegistryModel): boolean {
  const family = model.family.toLowerCase();
  return RECOMMENDABLE_PROVIDER_FAMILY_PREFIXES[model.provider].some((prefix) =>
    family.startsWith(prefix),
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
  if (value === "stt") return "speech-to-text";
  if (
    value === "billing" ||
    value === "billing-routine" ||
    value === "billing-risky" ||
    value === "billing-incident"
  ) {
    return "customer-support";
  }
  return USE_CASES.find((useCase) => useCase === value);
}

function normalizeSpeechToSpeechModels(
  exchangeRate?: ExchangeRate,
): RegistryModel[] {
  return (
    AA_SPEECH_TO_SPEECH_MODELS as readonly ArtificialAnalysisSpeechToSpeechModel[]
  )
    .map((model) => normalizeSpeechToSpeechModel(model, exchangeRate))
    .filter((model): model is RegistryModel => model !== undefined);
}

function normalizeSpeechToSpeechModel(
  model: ArtificialAnalysisSpeechToSpeechModel,
  exchangeRate?: ExchangeRate,
): RegistryModel | undefined {
  const provider = asProvider(model.provider);
  if (!provider) return undefined;

  const pricing: ModelPricing = {
    ...optionalNumberPrice("audioOutputPerHour", model.pricePerHourOutput),
    ...optionalNumberPrice(
      "benchmarkInputAudioPerHour",
      positiveNumberOrUndefined(model.costPerHourOfInputAudio),
    ),
    ...optionalNumberPrice("benchmarkCostPerTask", model.averageCostPerTask),
  };

  return {
    id: model.slug,
    provider,
    name: model.shortName || model.name,
    family: speechFamily(provider, model.modelSlug),
    contextWindow: 0,
    outputLimit: 0,
    pricing: exchangeRate ? convertPricing(pricing, exchangeRate) : pricing,
    capabilities: {
      vision: false,
      pdf: false,
      reasoning: model.bbaScore !== undefined,
      toolCalling: model.tauVoiceAggScore !== undefined,
      structuredOutput: false,
    },
    modalities: {
      input: ["audio"],
      output: ["audio"],
    },
    openWeights: false,
    tier: "fast",
    deprecated: false,
    updatedAt: AA_SPEECH_TO_SPEECH_EXTRACTED_AT,
    benchmarks: {
      voice: {
        ...optionalBenchmark("speechReasoning", model.bbaScore),
        ...optionalBenchmark("agenticPerformance", model.tauVoiceAggScore),
        ...optionalBenchmark(
          "telecomAgenticPerformance",
          model.tauVoiceTelecomScore,
        ),
        ...optionalBenchmark(
          "retailAgenticPerformance",
          model.tauVoiceRetailScore,
        ),
        ...optionalBenchmark(
          "airlineAgenticPerformance",
          model.tauVoiceAirlineScore,
        ),
        ...optionalBenchmark("conversationalDynamics", model.fdbScore),
        ...optionalBenchmark(
          "timeToFirstAudioSeconds",
          model.timeToFirstAudioSeconds,
        ),
        source: "artificialanalysis",
        extractedAt: AA_SPEECH_TO_SPEECH_EXTRACTED_AT,
      },
    },
  };
}

function speechFamily(provider: ProviderId, modelSlug: string): string {
  if (provider === "openai") return "gpt-realtime";
  if (provider === "google") return "gemini-live";
  if (provider === "xai") return "grok-voice";
  return modelSlug;
}

function buildBenchmarkProviderSummaries(
  candidates: BenchmarkCandidate[],
): ProviderSummary[] {
  return SUPPORTED_PROVIDERS.map((provider) => {
    const providerCandidates = candidates.filter(
      (candidate) => candidate.provider === provider,
    );
    return {
      provider,
      total: providerCandidates.length,
      active: providerCandidates.filter((candidate) => candidate.recommendable)
        .length,
    };
  }).filter((summary) => summary.total > 0);
}

function buildBenchmarkCandidates(
  models: RegistryModel[],
  artificialAnalysisModels: ArtificialAnalysisModel[],
  artificialAnalysisSpeechToTextModels: ArtificialAnalysisSpeechToTextModel[],
  exchangeRate?: ExchangeRate,
  generatedAt = new Date().toISOString(),
): BenchmarkCandidate[] {
  const candidates = new Map<string, BenchmarkCandidate>();

  for (const aaModel of artificialAnalysisModels) {
    const provider = providerFromArtificialAnalysis(aaModel);
    if (!provider) continue;

    const aaKeys = artificialAnalysisKeys(aaModel);
    const registryModel = findRegistryModel(models, provider, aaKeys);
    const signals = {
      ...benchmarkSignalsFromArtificialAnalysis(aaModel),
      ...efficiencySignalsForKeys(aaKeys, exchangeRate),
      ...autoCloseSignalsForKeys(aaKeys, exchangeRate),
    };
    if (!hasAnyTextQualitySignal(signals)) continue;

    const aaPricing = pricingFromArtificialAnalysis(aaModel, exchangeRate);
    const generatedPricing = pricingForKeys(aaKeys, exchangeRate);
    const pricing = hasTokenPricing(aaPricing)
      ? aaPricing
      : hasTokenPricing(generatedPricing)
        ? generatedPricing
        : (registryModel?.pricing ?? {});
    const id = registryModel?.id ?? stringValue(aaModel.slug ?? aaModel.id, "");
    if (!id) continue;

    const candidate = benchmarkCandidateFromRegistry({
      id,
      provider,
      name: registryModel?.name ?? stringValue(aaModel.name, id),
      benchmarks: { llm: signals },
      pricing,
      registryModel,
    });
    candidates.set(candidate.id, candidate);
  }

  for (const efficiencyModel of AA_LLM_EFFICIENCY_MODELS as readonly ArtificialAnalysisLlmEfficiencyModel[]) {
    const provider = providerFromArtificialAnalysisEfficiency(efficiencyModel);
    if (!provider) continue;

    const existing = candidates.get(efficiencyModel.slug);
    const signals = {
      ...(existing?.benchmarks.llm ?? {}),
      ...benchmarkSignalsFromArtificialAnalysisEfficiency(
        efficiencyModel,
        exchangeRate,
      ),
      ...autoCloseSignalsForSlug(efficiencyModel.slug, exchangeRate),
    };
    if (!hasAnyTextQualitySignal(signals)) continue;
    const generatedPricing = pricingFromArtificialAnalysisPricing(
      pricingModelForSlug(efficiencyModel.slug),
      exchangeRate,
    );
    const frontierPricing = pricingFromArtificialAnalysisEfficiency(
      efficiencyModel,
      exchangeRate,
    );
    const pricing = hasTokenPricing(existing?.pricing ?? {})
      ? existing!.pricing
      : hasTokenPricing(generatedPricing)
        ? generatedPricing
        : frontierPricing;

    const candidate = benchmarkCandidateFromRegistry({
      id: existing?.id ?? efficiencyModel.slug,
      provider,
      name: existing?.name ?? efficiencyModel.label,
      benchmarks: { llm: signals },
      pricing,
      contextWindow:
        existing?.contextWindow ?? efficiencyModel.contextWindowTokens,
    });
    candidates.set(candidate.id, candidate);
  }

  for (const recommendationModel of AA_CUSTOMER_SUPPORT_RECOMMENDATIONS as readonly ArtificialAnalysisCustomerSupportRecommendation[]) {
    const provider = recommendationModel.provider;
    if (!SUPPORTED_PROVIDERS.includes(provider)) continue;

    const existing = candidates.get(recommendationModel.slug);
    const signals = mergeBenchmarkSignals(
      benchmarkSignalsFromCustomerSupportRecommendation(
        recommendationModel,
        exchangeRate,
      ),
      existing?.benchmarks.llm,
      autoCloseSignalsForSlug(recommendationModel.slug, exchangeRate),
    );
    const generatedPricing = pricingFromCustomerSupportRecommendation(
      recommendationModel,
      exchangeRate,
    );
    const pricing = hasTokenPricing(existing?.pricing ?? {})
      ? existing!.pricing
      : generatedPricing;

    const candidate = benchmarkCandidateFromRegistry({
      id: existing?.id ?? recommendationModel.slug,
      provider,
      name: existing?.name ?? recommendationModel.label,
      benchmarks: { llm: signals },
      pricing,
      capabilities:
        capabilitiesFromCustomerSupportRecommendation(recommendationModel),
      contextWindow:
        existing?.contextWindow ?? recommendationModel.contextWindow,
    });
    candidates.set(candidate.id, candidate);
  }

  for (const autoCloseModel of AI_AUTOCLOSE_BENCHMARKS as readonly AiAutoCloseBenchmarkModel[]) {
    if (autoCloseModel.id !== "gemini-3-flash-reasoning") continue;

    const existing = candidates.get(autoCloseModel.id);
    const signals = {
      ...standaloneGeminiFlashSignals(autoCloseModel, exchangeRate),
      ...(existing?.benchmarks.llm ?? {}),
      intelligenceRunTotalCost:
        existing?.benchmarks.llm?.intelligenceRunTotalCost ??
        standaloneGeminiFlashSignals(autoCloseModel, exchangeRate)
          .intelligenceRunTotalCost,
      ...autoCloseSignalsFromBenchmark(autoCloseModel, exchangeRate),
    };
    const candidate = benchmarkCandidateFromRegistry({
      id: autoCloseModel.id,
      provider: autoCloseModel.provider,
      name: existing?.name ?? autoCloseModel.displayName,
      benchmarks: { llm: signals },
      pricing: hasTokenPricing(existing?.pricing ?? {})
        ? existing!.pricing
        : geminiFlashPreviewPricing(exchangeRate),
      contextWindow: existing?.contextWindow ?? 1_000_000,
      capabilities: {
        vision: true,
        reasoning: true,
        pdf: false,
        toolCalling: false,
        structuredOutput: false,
      },
    });
    candidates.set(candidate.id, candidate);
  }

  for (const model of models) {
    if (!model.benchmarks?.voice) continue;
    const candidate = benchmarkCandidateFromRegistry({
      id: model.id,
      provider: model.provider,
      name: model.name,
      benchmarks: { voice: model.benchmarks.voice },
      pricing: model.pricing,
      registryModel: model,
    });
    candidates.set(candidate.id, candidate);
  }

  for (const sttModel of artificialAnalysisSpeechToTextModels) {
    for (const candidate of benchmarkCandidatesFromSpeechToTextModel(
      sttModel,
      exchangeRate,
      generatedAt,
    )) {
      candidates.set(candidate.id, candidate);
    }
  }

  return [...candidates.values()];
}

function benchmarkCandidatesFromSpeechToTextModel(
  model: ArtificialAnalysisSpeechToTextModel,
  exchangeRate: ExchangeRate | undefined,
  generatedAt: string,
): BenchmarkCandidate[] {
  const creatorProvider = providerFromSpeechToTextCreator(model);

  const modelName = stringValue(model.name, stringValue(model.id, ""));
  if (!modelName) return [];

  const baseSlug = slugFrom(
    stringValue(
      model.slug,
      modelSlugName(
        modelName,
        creatorProvider ? PROVIDER_DISPLAY_NAMES[creatorProvider] : undefined,
      ),
    ),
  );
  const deprecated = isKnownDeprecatedModel(baseSlug, modelName);
  const extractedAt = stringValue(model.extractedAt, generatedAt);
  const providerRows = speechToTextProviderRows(model);

  return providerRows.flatMap((host) => {
    const hostProvider = providerFromSpeechToTextHost(host);
    const provider =
      creatorProvider === "nvidia"
        ? creatorProvider
        : (hostProvider ?? (host ? undefined : creatorProvider));
    if (!provider) return [];

    const hostName = stringValue(host?.name, "");
    const hostSlug = stringValue(host?.slug, "");
    const id = [
      provider,
      baseSlug,
      hostSlug && hostSlug !== provider ? slugFrom(hostSlug) : "",
    ]
      .filter(Boolean)
      .join("-");
    const pricing: ModelPricing = {
      ...optionalNumberPrice(
        "transcriptionCostPer1kMinutes",
        nonNegativeNumberOrUndefined(
          numberOrUndefined(host?.price_per_1k_minutes),
        ),
      ),
    };

    return benchmarkCandidateFromRegistry({
      id,
      provider,
      name: modelName,
      benchmarks: {
        speechToText: {
          ...optionalSpeechToTextBenchmark(
            "aaWer",
            numberOrUndefined(host?.aa_wer_index) ??
              numberOrUndefined(model.aa_wer_index),
          ),
          ...optionalSpeechToTextBenchmark(
            "agentTalkWer",
            numberOrUndefined(host?.aa_agenttalk) ??
              numberOrUndefined(model.aa_agenttalk),
          ),
          ...optionalSpeechToTextBenchmark(
            "voxpopuliWer",
            numberOrUndefined(host?.voxpopuli_cleaned_aa) ??
              numberOrUndefined(model.voxpopuli_cleaned_aa),
          ),
          ...optionalSpeechToTextBenchmark(
            "earnings22Wer",
            numberOrUndefined(host?.earnings_22_cleaned_aa) ??
              numberOrUndefined(model.earnings_22_cleaned_aa),
          ),
          ...optionalSpeechToTextBenchmark(
            "speedFactor",
            positiveNumberOrUndefined(
              numberOrUndefined(host?.median_speed_factor),
            ),
          ),
          ...(hostName ? { hostingProviderName: hostName } : {}),
          ...(hostSlug ? { hostingProviderSlug: hostSlug } : {}),
          source: "artificialanalysis",
          extractedAt,
        },
      },
      pricing: exchangeRate ? convertPricing(pricing, exchangeRate) : pricing,
      deprecated,
    });
  });
}

function benchmarkCandidateFromRegistry(input: {
  id: string;
  provider: ProviderId;
  name: string;
  benchmarks: BenchmarkCandidate["benchmarks"];
  pricing: ModelPricing;
  registryModel?: RegistryModel;
  contextWindow?: number | null;
  capabilities?: Record<Capability, boolean> | null;
  deprecated?: boolean | null;
}): BenchmarkCandidate {
  const model = input.registryModel;
  const deprecated = model?.deprecated ?? input.deprecated ?? null;
  const availability = input.benchmarks.llm
    ? productionAvailabilityForTextModel(
        input.id,
        input.name,
        input.benchmarks.llm,
      )
    : undefined;
  const recommendable = isBenchmarkCandidateRecommendable(
    input.provider,
    input.id,
    input.name,
    input.benchmarks,
    input.pricing,
    model,
    deprecated,
  );

  return {
    id: input.id,
    provider: input.provider,
    name: input.name,
    source: "artificialanalysis",
    benchmarks: input.benchmarks,
    pricing: input.pricing,
    ...(model ? { registryModelId: model.id } : {}),
    recommendable,
    ...(availability ? { availability } : {}),
    family: model?.family ?? null,
    contextWindow: model?.contextWindow ?? input.contextWindow ?? null,
    outputLimit: model?.outputLimit ?? null,
    capabilities:
      model?.capabilities ??
      input.capabilities ??
      inferredTextCapabilities(input.id, input.name, input.benchmarks.llm) ??
      null,
    modalities: model?.modalities ?? null,
    ...(model?.releaseDate ? { releaseDate: model.releaseDate } : {}),
    ...(model?.knowledgeCutoff
      ? { knowledgeCutoff: model.knowledgeCutoff }
      : {}),
    openWeights: model?.openWeights ?? null,
    tier: model?.tier ?? null,
    deprecated,
    updatedAt: model?.updatedAt ?? null,
  };
}

function capabilitiesFromCustomerSupportRecommendation(
  model: ArtificialAnalysisCustomerSupportRecommendation,
): Record<Capability, boolean> {
  return {
    vision: model.imageInput,
    reasoning: model.reasoning,
    pdf: false,
    toolCalling: false,
    structuredOutput: false,
  };
}

function inferredTextCapabilities(
  id: string,
  name: string,
  signals?: BenchmarkSignals,
): Record<Capability, boolean> | null {
  if (
    id === "gemini-3-flash-reasoning" &&
    signals?.autoClose?.modelKey === "gemini:gemini-3-flash-preview"
  ) {
    return {
      vision: true,
      reasoning: true,
      pdf: false,
      toolCalling: false,
      structuredOutput: false,
    };
  }

  const searchable = `${id} ${name}`.toLowerCase();
  if (!searchable.includes("reasoning")) return null;
  return {
    vision: false,
    reasoning: true,
    pdf: false,
    toolCalling: false,
    structuredOutput: false,
  };
}

function isBenchmarkCandidateRecommendable(
  provider: ProviderId,
  id: string,
  name: string,
  benchmarks: BenchmarkCandidate["benchmarks"],
  pricing: ModelPricing,
  registryModel?: RegistryModel,
  deprecated?: boolean | null,
): boolean {
  if (!SUPPORTED_PROVIDERS.includes(provider)) return false;
  if (registryModel?.deprecated || deprecated === true) return false;

  if (benchmarks.voice) {
    return (
      pricing.benchmarkInputAudioPerHour !== undefined &&
      pricing.benchmarkInputAudioPerHour > 0 &&
      hasPositiveCandidateAudioPrice(pricing)
    );
  }

  if (benchmarks.speechToText) {
    return (
      isNumber(benchmarks.speechToText.aaWer) &&
      pricing.transcriptionCostPer1kMinutes !== undefined &&
      pricing.transcriptionCostPer1kMinutes > 0
    );
  }

  return (
    hasRecommendableTextBenchmarkBasics(benchmarks, pricing) &&
    isProductionAvailabilityAllowed(
      productionAvailabilityForTextModel(id, name, benchmarks.llm),
    )
  );
}

function hasRecommendableBenchmarkBasics(
  candidate: BenchmarkCandidate,
): boolean {
  if (candidate.benchmarks.voice) {
    return (
      candidate.pricing.benchmarkInputAudioPerHour !== undefined &&
      candidate.pricing.benchmarkInputAudioPerHour > 0 &&
      hasPositiveCandidateAudioPrice(candidate.pricing)
    );
  }

  if (candidate.benchmarks.speechToText) {
    return (
      isNumber(candidate.benchmarks.speechToText.aaWer) &&
      candidate.pricing.transcriptionCostPer1kMinutes !== undefined &&
      candidate.pricing.transcriptionCostPer1kMinutes > 0
    );
  }

  return hasRecommendableTextBenchmarkBasics(
    candidate.benchmarks,
    candidate.pricing,
  );
}

function hasRecommendableTextBenchmarkBasics(
  benchmarks: BenchmarkCandidate["benchmarks"],
  pricing: ModelPricing,
): boolean {
  return (
    benchmarks.llm !== undefined &&
    hasAnyTextQualitySignal(benchmarks.llm) &&
    hasTokenPricing(pricing)
  );
}

function productionAvailabilityForTextModel(
  id: string,
  name: string,
  signals?: BenchmarkSignals,
): ModelAvailabilityMetadata {
  const benchmarkAvailability = signals?.autoClose?.availability;
  const heuristicAvailability = heuristicAvailabilityForTextModel(id, name);

  if (
    benchmarkAvailability?.status === "preview" &&
    benchmarkAvailability.acceptedRisk &&
    heuristicAvailability.status === "preview"
  ) {
    return benchmarkAvailability;
  }

  if (!isProductionAvailabilityAllowed(heuristicAvailability)) {
    return heuristicAvailability;
  }

  return benchmarkAvailability ?? heuristicAvailability;
}

function isProductionAvailabilityAllowed(
  availability: ModelAvailabilityMetadata,
  filters?: ModelFilters,
): boolean {
  if (filters?.allowPreview && availability.status === "preview") return true;
  return availability.status === "production" || availability.acceptedRisk;
}

function heuristicAvailabilityForTextModel(
  id: string,
  name: string,
): ModelAvailabilityMetadata {
  const searchable = `${id} ${name}`.toLowerCase();
  const normalizedId = id.toLowerCase().replace(/\./g, "-");
  const retirementDate = retirementDateForModel(normalizedId);

  if (searchable.includes("retired")) {
    return {
      status: "retired",
      acceptedRisk: false,
      reason: "Model metadata marks this model as retired.",
    };
  }
  if (searchable.includes("deprecated")) {
    return {
      status: "deprecated",
      acceptedRisk: false,
      reason: "Model metadata marks this model as deprecated.",
    };
  }
  if (retirementDate && isNearRetirement(retirementDate)) {
    return {
      status: "near-retirement",
      acceptedRisk: false,
      reason: `Model retirement date ${retirementDate} is within ${NEAR_RETIREMENT_DAYS} days.`,
    };
  }
  if (searchable.includes("preview")) {
    return {
      status: "preview",
      acceptedRisk: false,
      reason:
        "Preview-only models are excluded from default production recommendations.",
    };
  }
  if (searchable.includes("experimental") || /\bexp\b/.test(searchable)) {
    return {
      status: "experimental",
      acceptedRisk: false,
      reason:
        "Experimental models are excluded from default production recommendations.",
    };
  }
  if (/(^|[-_\s])latest($|[-_\s])/.test(searchable)) {
    return {
      status: "latest-alias",
      acceptedRisk: false,
      reason:
        "Latest aliases are excluded because their behavior can change without a pinned model id.",
    };
  }

  return {
    status: "production",
    acceptedRisk: false,
    reason:
      "No default-production exclusion was found in local model metadata.",
  };
}

function retirementDateForModel(id: string): string | undefined {
  return MODEL_RETIREMENT_DATES[id as keyof typeof MODEL_RETIREMENT_DATES];
}

function isKnownDeprecatedModel(id: string, name: string): boolean {
  const searchable = `${id} ${name}`.toLowerCase();
  if (searchable.includes("deprecated") || searchable.includes("retired")) {
    return true;
  }

  return [slugFrom(id), slugFrom(name)].some((slug) => {
    const retirementDate = retirementDateForModel(slug);
    return retirementDate !== undefined && isNearRetirement(retirementDate);
  });
}

function isDeprecatedBenchmarkCandidate(
  candidate: BenchmarkCandidate,
): boolean {
  return (
    candidate.deprecated === true ||
    isKnownDeprecatedModel(candidate.id, candidate.name)
  );
}

function isNearRetirement(retirementDate: string): boolean {
  const retirement = Date.parse(`${retirementDate}T00:00:00Z`);
  if (!Number.isFinite(retirement)) return false;

  const now = Date.now();
  const daysUntilRetirement = (retirement - now) / (24 * 60 * 60 * 1000);
  return daysUntilRetirement <= NEAR_RETIREMENT_DAYS;
}

function hasAnyTextQualitySignal(signals: BenchmarkSignals): boolean {
  return [
    signals.autoClose?.accuracy,
    signals.intelligence,
    signals.coding,
    signals.instructionFollowing,
    signals.terminalBench,
    signals.tauTelecom,
    signals.professional,
  ].some(isNumber);
}

function hasCustomerSupportBenchmarkSignals(
  signals: BenchmarkSignals | undefined,
): boolean {
  if (!signals) return false;
  if (signals.autoClose) return true;

  return (
    isNumber(signals.instructionFollowing) &&
    [signals.agentic, signals.tauTelecom, signals.professional].some(isNumber)
  );
}

function findRegistryModel(
  models: RegistryModel[],
  provider: ProviderId,
  aaKeys: Set<string>,
): RegistryModel | undefined {
  return models.find(
    (candidate) =>
      candidate.provider === provider &&
      modelKeys(candidate).some((key) => aaKeys.has(key)),
  );
}

function efficiencySignalsForKeys(
  aaKeys: Set<string>,
  exchangeRate?: ExchangeRate,
): BenchmarkSignals {
  const match = (
    AA_LLM_EFFICIENCY_MODELS as readonly ArtificialAnalysisLlmEfficiencyModel[]
  ).find((efficiencyModel) => {
    const efficiencyKeys = artificialAnalysisEfficiencyKeys(efficiencyModel);
    return [...efficiencyKeys].some((key) => aaKeys.has(key));
  });

  return match
    ? benchmarkSignalsFromArtificialAnalysisEfficiency(match, exchangeRate)
    : {};
}

function pricingForKeys(
  aaKeys: Set<string>,
  exchangeRate?: ExchangeRate,
): ModelPricing {
  const match = (
    AA_LLM_PRICING_MODELS as readonly ArtificialAnalysisLlmPricingModel[]
  ).find((pricingModel) => {
    const pricingKeys = artificialAnalysisPricingKeys(pricingModel);
    return [...pricingKeys].some((key) => aaKeys.has(key));
  });

  return pricingFromArtificialAnalysisPricing(match, exchangeRate);
}

function autoCloseSignalsForKeys(
  aaKeys: Set<string>,
  exchangeRate?: ExchangeRate,
): Pick<BenchmarkSignals, "autoClose"> | Record<string, never> {
  const match = (
    AI_AUTOCLOSE_BENCHMARKS as readonly AiAutoCloseBenchmarkModel[]
  ).find((benchmarkModel) => {
    const benchmarkKeys = autoCloseBenchmarkKeys(benchmarkModel);
    return [...benchmarkKeys].some((key) => aaKeys.has(key));
  });

  return autoCloseSignalsFromBenchmark(match, exchangeRate);
}

function autoCloseSignalsForSlug(
  slug: string,
  exchangeRate?: ExchangeRate,
): Pick<BenchmarkSignals, "autoClose"> | Record<string, never> {
  const match = (
    AI_AUTOCLOSE_BENCHMARKS as readonly AiAutoCloseBenchmarkModel[]
  ).find((benchmarkModel) => benchmarkModel.id === slug);

  return autoCloseSignalsFromBenchmark(match, exchangeRate);
}

function pricingModelForSlug(
  slug: string,
): ArtificialAnalysisLlmPricingModel | undefined {
  return (
    AA_LLM_PRICING_MODELS as readonly ArtificialAnalysisLlmPricingModel[]
  ).find((pricingModel) => pricingModel.slug === slug);
}

function pricingFromArtificialAnalysis(
  model: ArtificialAnalysisModel,
  exchangeRate?: ExchangeRate,
): ModelPricing {
  const input = firstNestedNumber(model as Record<string, unknown>, [
    ["pricing", "input"],
    ["pricing", "inputPerMTok"],
    ["prices", "input"],
    ["price", "input"],
    ["cost", "input"],
    ["input_price"],
    ["input_cost"],
    ["price_1m_input_tokens"],
    ["input_cost_per_million_tokens"],
  ]);
  const output = firstNestedNumber(model as Record<string, unknown>, [
    ["pricing", "output"],
    ["pricing", "outputPerMTok"],
    ["prices", "output"],
    ["price", "output"],
    ["cost", "output"],
    ["output_price"],
    ["output_cost"],
    ["price_1m_output_tokens"],
    ["output_cost_per_million_tokens"],
  ]);
  const pricing: ModelPricing = {
    ...optionalTokenPrice("inputPerMTok", input),
    ...optionalTokenPrice("outputPerMTok", output),
  };

  return exchangeRate ? convertPricing(pricing, exchangeRate) : pricing;
}

function pricingFromArtificialAnalysisPricing(
  model: ArtificialAnalysisLlmPricingModel | undefined,
  exchangeRate?: ExchangeRate,
): ModelPricing {
  if (!model) return {};

  const pricing: ModelPricing = {
    inputPerMTok: model.inputPrice,
    outputPerMTok: model.outputPrice,
    ...optionalTokenPrice("cacheReadPerMTok", model.cacheHitPrice),
  };

  return exchangeRate ? convertPricing(pricing, exchangeRate) : pricing;
}

function pricingFromArtificialAnalysisEfficiency(
  model: ArtificialAnalysisLlmEfficiencyModel,
  exchangeRate?: ExchangeRate,
): ModelPricing {
  const pricing: ModelPricing = {
    ...optionalTokenPrice("inputPerMTok", model.inputPrice),
    ...optionalTokenPrice("outputPerMTok", model.outputPrice),
    ...optionalTokenPrice("cacheReadPerMTok", model.cacheHitPrice),
  };

  return exchangeRate ? convertPricing(pricing, exchangeRate) : pricing;
}

function pricingFromCustomerSupportRecommendation(
  model: ArtificialAnalysisCustomerSupportRecommendation,
  exchangeRate?: ExchangeRate,
): ModelPricing {
  const pricing: ModelPricing = {
    inputPerMTok: model.inputPrice,
    outputPerMTok: model.outputPrice,
    ...optionalTokenPrice("cacheReadPerMTok", model.cacheHitPrice),
  };

  return exchangeRate ? convertPricing(pricing, exchangeRate) : pricing;
}

function firstNestedNumber(
  source: Record<string, unknown>,
  paths: string[][],
): number | undefined {
  for (const path of paths) {
    let value: unknown = source;
    for (const key of path) {
      if (!value || typeof value !== "object") {
        value = undefined;
        break;
      }
      value = (value as Record<string, unknown>)[key];
    }
    const number = numberOrUndefined(value);
    if (number !== undefined) return number;
  }
  return undefined;
}

function providerFromArtificialAnalysis(
  model: ArtificialAnalysisModel,
): ProviderId | undefined {
  const slug = stringValue(model.model_creator?.slug, "").toLowerCase();
  const name = stringValue(model.model_creator?.name, "").toLowerCase();
  if (slug.includes("openai") || name.includes("openai")) return "openai";
  if (slug.includes("google") || name.includes("google")) return "google";
  if (slug.includes("xai") || name.includes("xai")) return "xai";
  if (slug.includes("anthropic") || name.includes("anthropic"))
    return "anthropic";
  return undefined;
}

function providerFromArtificialAnalysisEfficiency(
  model: ArtificialAnalysisLlmEfficiencyModel,
): ProviderId | undefined {
  const provider = model.provider?.toLowerCase();
  if (provider === "openai") return "openai";
  if (provider === "google") return "google";
  if (provider === "xai") return "xai";
  if (provider === "anthropic") return "anthropic";

  const searchable = `${model.slug} ${model.label}`.toLowerCase();
  if (searchable.includes("gpt") || searchable.includes("openai"))
    return "openai";
  if (searchable.includes("gemini") || searchable.includes("google"))
    return "google";
  if (searchable.includes("grok") || searchable.includes("xai")) return "xai";
  if (searchable.includes("claude") || searchable.includes("anthropic")) {
    return "anthropic";
  }
  return undefined;
}

function providerFromSpeechToTextCreator(
  model: ArtificialAnalysisSpeechToTextModel,
): ProviderId | undefined {
  const slug = stringValue(model.model_creator?.slug, "").toLowerCase();
  const name = stringValue(model.model_creator?.name, "").toLowerCase();
  if (slug.includes("openai") || name.includes("openai")) return "openai";
  if (slug.includes("google") || name.includes("google")) return "google";
  if (slug.includes("xai") || name.includes("xai")) return "xai";
  if (slug.includes("anthropic") || name.includes("anthropic"))
    return "anthropic";
  if (slug.includes("nvidia") || name.includes("nvidia")) return "nvidia";
  if (slug.includes("groq") || name.includes("groq")) return "groq";
  if (slug.includes("elevenlabs") || name.includes("elevenlabs")) {
    return "elevenlabs";
  }
  return undefined;
}

function providerFromSpeechToTextHost(
  host: ArtificialAnalysisSpeechToTextProvider | undefined,
): ProviderId | undefined {
  const slug = stringValue(host?.slug, "").toLowerCase();
  const name = stringValue(host?.name, "").toLowerCase();
  if (slug.includes("openai") || name.includes("openai")) return "openai";
  if (slug.includes("google") || name.includes("google")) return "google";
  if (slug.includes("xai") || name.includes("xai")) return "xai";
  if (slug.includes("anthropic") || name.includes("anthropic"))
    return "anthropic";
  if (slug.includes("groq") || name.includes("groq")) return "groq";
  if (slug.includes("elevenlabs") || name.includes("elevenlabs")) {
    return "elevenlabs";
  }
  return undefined;
}

function speechToTextProviderRows(
  model: ArtificialAnalysisSpeechToTextModel,
): Array<ArtificialAnalysisSpeechToTextProvider | undefined> {
  return Array.isArray(model.providers) && model.providers.length
    ? (model.providers as ArtificialAnalysisSpeechToTextProvider[])
    : [undefined];
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
      firstScore(evaluations, [
        "ifbench",
        "if_bench",
        "ifeval",
        "ifeval_strict",
      ]),
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
        "tau2",
        "tau2_telecom",
        "tau2_bench",
        "tau_bench_telecom",
      ]),
    ),
    ...optionalSignal(
      "professional",
      firstScore(evaluations, [
        "gdpval",
        "gdpval_aa",
        "gdpval_normalized",
        "gdpval_index",
        "professional_index",
      ]),
    ),
    ...optionalSignal(
      "speed",
      positiveNumberOrUndefined(
        numberOrUndefined(model.median_output_tokens_per_second),
      ),
    ),
    ...optionalSignal(
      "latency",
      positiveNumberOrUndefined(
        numberOrUndefined(
          model.median_time_to_first_token_seconds ??
            model.median_time_to_first_answer_token,
        ),
      ),
    ),
  };
}

function benchmarkSignalsFromArtificialAnalysisEfficiency(
  model: ArtificialAnalysisLlmEfficiencyModel,
  exchangeRate?: ExchangeRate,
): BenchmarkSignals {
  const rate = exchangeRate?.rate ?? 1;
  const signals: BenchmarkSignals = {};
  if (model.intelligenceIndex !== undefined)
    signals.intelligence = model.intelligenceIndex;
  if (model.agenticIndex !== undefined) signals.agentic = model.agenticIndex;
  if (model.ifbench !== undefined) signals.instructionFollowing = model.ifbench;
  if (model.tau2 !== undefined) signals.tauTelecom = model.tau2;
  const professional = model.gdpvalNormalized ?? model.gdpval;
  if (professional !== undefined) signals.professional = professional;
  if (model.terminalBenchHard !== undefined)
    signals.terminalBench = model.terminalBenchHard;
  const coding = model.codingIndex ?? model.sciCode;
  if (coding !== undefined) signals.coding = coding;
  if (model.lcr !== undefined) signals.lcr = model.lcr;
  if (model.hle !== undefined) signals.hle = model.hle;
  if (model.gpqa !== undefined) signals.gpqa = model.gpqa;
  if (model.critpt !== undefined) signals.critpt = model.critpt;
  if (model.omniscienceIndex !== undefined)
    signals.omniscience = model.omniscienceIndex;

  const speed = positiveNumberOrUndefined(model.outputSpeed);
  if (speed !== undefined) signals.speed = speed;
  const latency = positiveNumberOrUndefined(model.latency);
  if (latency !== undefined) signals.latency = latency;

  const answerCost = audValueOrUndefined(model.intelligenceRunAnswerCost, rate);
  if (answerCost !== undefined) signals.intelligenceRunAnswerCost = answerCost;
  const reasoningCost = audValueOrUndefined(
    model.intelligenceRunReasoningCost,
    rate,
  );
  if (reasoningCost !== undefined)
    signals.intelligenceRunReasoningCost = reasoningCost;
  const inputCost = audValueOrUndefined(model.intelligenceRunInputCost, rate);
  if (inputCost !== undefined) signals.intelligenceRunInputCost = inputCost;
  const totalCost = audValueOrUndefined(model.intelligenceRunTotalCost, rate);
  if (totalCost !== undefined) signals.intelligenceRunTotalCost = totalCost;

  if (model.intelligenceRunAnswerTokens !== undefined) {
    signals.intelligenceRunAnswerTokens = model.intelligenceRunAnswerTokens;
  }
  if (model.intelligenceRunReasoningTokens !== undefined) {
    signals.intelligenceRunReasoningTokens =
      model.intelligenceRunReasoningTokens;
  }
  if (model.intelligenceRunOutputTokens !== undefined) {
    signals.intelligenceRunOutputTokens = model.intelligenceRunOutputTokens;
  }

  return signals;
}

function benchmarkSignalsFromCustomerSupportRecommendation(
  model: ArtificialAnalysisCustomerSupportRecommendation,
  exchangeRate?: ExchangeRate,
): BenchmarkSignals {
  const rate = exchangeRate?.rate ?? 1;
  return {
    customerSupportRank: model.rank,
    ...optionalSignal("intelligence", model.intelligenceIndex),
    ...optionalSignal("agentic", model.agenticScore),
    ...optionalSignal("instructionFollowing", model.instructionFollowingScore),
    ...optionalSignal("speed", model.medianOutputSpeed),
    ...optionalSignal(
      "intelligenceRunTotalCost",
      audValueOrUndefined(model.intelligenceIndexCost, rate),
    ),
  };
}

function standaloneGeminiFlashSignals(
  model: AiAutoCloseBenchmarkModel,
  exchangeRate?: ExchangeRate,
): BenchmarkSignals {
  const rate = exchangeRate?.rate ?? 1;
  return {
    intelligence: 30,
    agentic: 30,
    instructionFollowing: 30,
    speed: 0,
    intelligenceRunTotalCost: audValueOrUndefined(model.costPer1000Usd, rate),
    ...autoCloseSignalsFromBenchmark(model, exchangeRate),
  };
}

function geminiFlashPreviewPricing(exchangeRate?: ExchangeRate): ModelPricing {
  const pricing: ModelPricing = {
    inputPerMTok: 0.5,
    outputPerMTok: 3,
  };
  return exchangeRate ? convertPricing(pricing, exchangeRate) : pricing;
}

function mergeBenchmarkSignals(
  ...layers: Array<
    | BenchmarkSignals
    | Pick<BenchmarkSignals, "autoClose">
    | Record<string, never>
    | undefined
  >
): BenchmarkSignals {
  return Object.assign({}, ...layers);
}

function autoCloseSignalsFromBenchmark(
  model: AiAutoCloseBenchmarkModel | undefined,
  exchangeRate?: ExchangeRate,
): Pick<BenchmarkSignals, "autoClose"> | Record<string, never> {
  if (!model) return {};

  const rate = exchangeRate?.rate ?? 1;
  const avgCostUsd = positiveNumberOrUndefined(model.avgCostUsd);
  const costPer1000Usd = positiveNumberOrUndefined(model.costPer1000Usd);

  return {
    autoClose: {
      source: "itsolver-autoclose",
      modelKey: model.modelKey,
      apiModel: model.apiModel,
      displayName: model.displayName,
      benchmarkReport: model.benchmarkReport,
      resultsFile: model.resultsFile,
      generatedAt: model.generatedAt,
      benchmarkCodeSha: model.benchmarkCodeSha,
      total: model.total,
      correctCount: model.correctCount,
      accuracy: model.accuracy,
      falsePositiveCount: model.falsePositiveCount,
      falseNegativeCount: model.falseNegativeCount,
      invalidCount: model.invalidCount,
      errorCount: model.errorCount,
      parseSuccessRate: model.parseSuccessRate,
      avgLatencyMs: model.avgLatencyMs,
      p95LatencyMs: model.p95LatencyMs,
      avgInputTokens: model.avgInputTokens,
      avgOutputTokens: model.avgOutputTokens,
      ...(avgCostUsd !== undefined ? { avgCostUsd } : {}),
      ...(costPer1000Usd !== undefined
        ? {
            costPer1000Usd,
            costPer1000Aud: audValueOrUndefined(costPer1000Usd, rate),
          }
        : {}),
      ...(model.costPer1000CorrectUsd !== undefined
        ? { costPer1000CorrectUsd: model.costPer1000CorrectUsd }
        : {}),
      weightedScore: model.weightedScore,
      sourceUrl: model.sourceUrl,
      verifiedOn: model.verifiedOn,
      ...(model.officialSourceUrl
        ? { officialSourceUrl: model.officialSourceUrl }
        : {}),
      ...(model.officialVerifiedOn
        ? { officialVerifiedOn: model.officialVerifiedOn }
        : {}),
      availability: {
        status: model.availability.status,
        acceptedRisk: model.availability.acceptedRisk,
        reason: model.availability.reason,
        ...(model.officialSourceUrl
          ? { sourceUrl: model.officialSourceUrl }
          : { sourceUrl: model.sourceUrl }),
        verifiedOn: model.officialVerifiedOn ?? model.verifiedOn,
      },
    },
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
  return value === undefined
    ? {}
    : ({ [key]: value } as Pick<BenchmarkSignals, K>);
}

function maxDefined(
  left: number | undefined,
  right: number | undefined,
): number | undefined {
  if (left === undefined) return right;
  if (right === undefined) return left;
  return Math.max(left, right);
}

function minDefined(
  left: number | undefined,
  right: number | undefined,
): number | undefined {
  if (left === undefined) return right;
  if (right === undefined) return left;
  return Math.min(left, right);
}

function artificialAnalysisKeys(model: ArtificialAnalysisModel): Set<string> {
  return new Set(
    [model.id, model.name, model.slug]
      .filter((value): value is string => typeof value === "string")
      .map(normalizeMatchKey),
  );
}

function artificialAnalysisEfficiencyKeys(
  model: ArtificialAnalysisLlmEfficiencyModel,
): Set<string> {
  return new Set(
    [
      model.slug,
      model.label,
      model.detailsUrl.split("/").filter(Boolean).at(-1),
    ]
      .filter((value): value is string => typeof value === "string")
      .map(normalizeMatchKey),
  );
}

function artificialAnalysisPricingKeys(
  model: ArtificialAnalysisLlmPricingModel,
): Set<string> {
  return new Set(
    [
      model.slug,
      model.label,
      model.detailsUrl.split("/").filter(Boolean).at(-1),
    ]
      .filter((value): value is string => typeof value === "string")
      .map(normalizeMatchKey),
  );
}

function autoCloseBenchmarkKeys(model: AiAutoCloseBenchmarkModel): Set<string> {
  return new Set(
    [model.id, model.modelKey, model.apiModel, model.displayName]
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
      cheapestPrice(right) - cheapestPrice(left) ||
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
    scoreRecommendation(right, filters, catalog, tier) -
      scoreRecommendation(left, filters, catalog, tier) ||
    compareForTier(left, right, tier)
  );
}

function compareBenchmarkCandidates(
  left: BenchmarkCandidate,
  right: BenchmarkCandidate,
  tier: Tier,
  filters: ModelFilters,
): number {
  if (
    filters.useCase === "customer-support" &&
    filters.includeItsBenchmark !== false
  ) {
    return compareCustomerSupportBenchmarkCandidates(left, right, tier);
  }

  if (filters.useCase === "customer-support" && tier === "best") {
    return compareCustomerSupportAaSupportOrder(left, right);
  }

  if (filters.useCase === "customer-support" && tier === "fast") {
    return (
      compareCustomerSupportRunCost(left, right) ||
      compareOptionalAsc(
        left.pricing.outputPerMTok,
        right.pricing.outputPerMTok,
      ) ||
      compareOptionalDesc(
        left.benchmarks.llm?.speed,
        right.benchmarks.llm?.speed,
      ) ||
      compareOptionalAsc(
        left.benchmarks.llm?.customerSupportRank,
        right.benchmarks.llm?.customerSupportRank,
      ) ||
      compareBenchmarkCandidateForTier(left, right, tier)
    );
  }

  if (filters.useCase === "speech-to-text") {
    return compareSpeechToTextBenchmarkCandidates(left, right, tier);
  }

  if (filters.useCase === "voice") {
    return compareVoiceBenchmarkCandidates(left, right, tier);
  }

  return (
    scoreBenchmarkCandidate(right, filters, tier) -
      scoreBenchmarkCandidate(left, filters, tier) ||
    compareBenchmarkCandidateForTier(left, right, tier)
  );
}

function compareSpeechToTextBenchmarkCandidates(
  left: BenchmarkCandidate,
  right: BenchmarkCandidate,
  tier: Tier,
): number {
  const leftSignals = left.benchmarks.speechToText;
  const rightSignals = right.benchmarks.speechToText;

  if (tier === "fast") {
    return (
      compareOptionalAsc(
        candidateTranscriptionCost(left),
        candidateTranscriptionCost(right),
      ) ||
      compareOptionalDesc(
        leftSignals?.speedFactor,
        rightSignals?.speedFactor,
      ) ||
      compareOptionalAsc(leftSignals?.aaWer, rightSignals?.aaWer) ||
      left.id.localeCompare(right.id)
    );
  }

  if (tier === "best") {
    return (
      compareOptionalAsc(leftSignals?.aaWer, rightSignals?.aaWer) ||
      compareOptionalDesc(
        leftSignals?.speedFactor,
        rightSignals?.speedFactor,
      ) ||
      compareOptionalAsc(
        candidateTranscriptionCost(left),
        candidateTranscriptionCost(right),
      ) ||
      left.id.localeCompare(right.id)
    );
  }

  return (
    compareOptionalAsc(leftSignals?.aaWer, rightSignals?.aaWer) ||
    compareOptionalAsc(
      candidateTranscriptionCost(left),
      candidateTranscriptionCost(right),
    ) ||
    compareOptionalDesc(leftSignals?.speedFactor, rightSignals?.speedFactor) ||
    left.id.localeCompare(right.id)
  );
}

function compareVoiceBenchmarkCandidates(
  left: BenchmarkCandidate,
  right: BenchmarkCandidate,
  tier: Tier,
): number {
  if (tier === "fast") {
    return (
      compareOptionalAsc(
        left.pricing.benchmarkInputAudioPerHour,
        right.pricing.benchmarkInputAudioPerHour,
      ) ||
      compareOptionalAsc(
        candidateAudioOutputCost(left),
        candidateAudioOutputCost(right),
      ) ||
      compareOptionalAsc(
        left.benchmarks.voice?.timeToFirstAudioSeconds,
        right.benchmarks.voice?.timeToFirstAudioSeconds,
      ) ||
      compareVoiceQualityOrder(left, right)
    );
  }

  return compareVoiceQualityOrder(left, right);
}

function compareVoiceQualityOrder(
  left: BenchmarkCandidate,
  right: BenchmarkCandidate,
): number {
  const leftVoice = left.benchmarks.voice;
  const rightVoice = right.benchmarks.voice;

  return (
    compareOptionalDesc(
      leftVoice?.agenticPerformance,
      rightVoice?.agenticPerformance,
    ) ||
    compareOptionalDesc(
      leftVoice?.speechReasoning,
      rightVoice?.speechReasoning,
    ) ||
    compareOptionalDesc(
      leftVoice?.telecomAgenticPerformance,
      rightVoice?.telecomAgenticPerformance,
    ) ||
    compareOptionalDesc(
      leftVoice?.conversationalDynamics,
      rightVoice?.conversationalDynamics,
    ) ||
    compareOptionalAsc(
      leftVoice?.timeToFirstAudioSeconds,
      rightVoice?.timeToFirstAudioSeconds,
    ) ||
    compareOptionalAsc(
      left.pricing.benchmarkInputAudioPerHour,
      right.pricing.benchmarkInputAudioPerHour,
    ) ||
    compareOptionalAsc(
      candidateAudioOutputCost(left),
      candidateAudioOutputCost(right),
    ) ||
    left.id.localeCompare(right.id)
  );
}

function compareCustomerSupportBenchmarkCandidates(
  left: BenchmarkCandidate,
  right: BenchmarkCandidate,
  tier: Tier,
): number {
  if (tier === "fast") {
    return (
      compareCustomerSupportRunCost(left, right) ||
      compareOptionalAsc(
        left.pricing.outputPerMTok,
        right.pricing.outputPerMTok,
      ) ||
      compareCustomerSupportSafetyOrder(left, right, {
        useCase: "customer-support",
      })
    );
  }

  return compareCustomerSupportSafetyOrder(left, right, {
    useCase: "customer-support",
  });
}

function compareCustomerSupportSafetyOrder(
  left: BenchmarkCandidate,
  right: BenchmarkCandidate,
  filters: ModelFilters,
): number {
  const leftSignals = left.benchmarks.llm;
  const rightSignals = right.benchmarks.llm;
  const leftAutoClose = leftSignals?.autoClose;
  const rightAutoClose = rightSignals?.autoClose;

  if (leftAutoClose && rightAutoClose) {
    return (
      compareOptionalAsc(
        autoCloseFalsePositiveRate(leftAutoClose),
        autoCloseFalsePositiveRate(rightAutoClose),
      ) ||
      compareOptionalDesc(leftAutoClose.accuracy, rightAutoClose.accuracy) ||
      compareCustomerSupportRunCost(left, right) ||
      compareOptionalAsc(
        leftAutoClose.invalidCount,
        rightAutoClose.invalidCount,
      ) ||
      compareOptionalAsc(
        leftAutoClose.falseNegativeCount,
        rightAutoClose.falseNegativeCount,
      ) ||
      compareCustomerSupportTierTieBreak(left, right, "best") ||
      left.id.localeCompare(right.id)
    );
  }

  if (leftAutoClose || rightAutoClose) return leftAutoClose ? -1 : 1;

  return (
    scoreBenchmarkCandidate(right, filters, "best") -
      scoreBenchmarkCandidate(left, filters, "best") ||
    compareBenchmarkCandidateForTier(left, right, "best")
  );
}

function compareCustomerSupportAaSupportOrder(
  left: BenchmarkCandidate,
  right: BenchmarkCandidate,
): number {
  return (
    customerSupportAaSupportScore(right) -
      customerSupportAaSupportScore(left) ||
    compareBenchmarkCandidateForTier(left, right, "balanced")
  );
}

function customerSupportAaSupportScore(candidate: BenchmarkCandidate): number {
  const signals = candidate.benchmarks.llm;
  if (signals?.customerSupportRank !== undefined) {
    return Math.max(0, 102 - signals.customerSupportRank * 2);
  }

  const quality = weightedAverage(
    [
      [signals?.agentic ?? signals?.tauTelecom, 0.25],
      [signals?.instructionFollowing, 0.3],
      [signals?.intelligence, 0.25],
      [signals?.professional, 0.1],
    ],
    60,
  );
  const speed = Math.min((signals?.speed ?? 0) / 220, 1) * 8;
  return (
    quality * 0.62 +
    costScore(
      {
        pricing: candidate.pricing,
      } as RegistryModel,
      "customer-support",
      signals,
      "balanced",
    ) *
      0.2 +
    customerSupportEfficiencyScore(signals) * 0.1 +
    speed
  );
}

function customerSupportEfficiencyScore(
  signals: BenchmarkSignals | undefined,
): number {
  const runCostValue =
    signals?.intelligenceRunTotalCost !== undefined
      ? Math.max(
          0,
          100 -
            Math.min(
              Math.log1p(signals.intelligenceRunTotalCost) / Math.log1p(8000),
              1,
            ) *
              100,
        )
      : undefined;
  const outputTokenValue =
    signals?.intelligenceRunOutputTokens !== undefined
      ? Math.max(
          0,
          100 -
            Math.min(
              Math.log1p(signals.intelligenceRunOutputTokens) /
                Math.log1p(250_000_000),
              1,
            ) *
              100,
        )
      : undefined;

  return weightedAverage(
    [
      [runCostValue, 0.45],
      [outputTokenValue, 0.55],
    ],
    50,
  );
}

function compareCustomerSupportRunCost(
  left: BenchmarkCandidate,
  right: BenchmarkCandidate,
): number {
  return (
    compareOptionalAsc(
      left.benchmarks.llm?.intelligenceRunTotalCost,
      right.benchmarks.llm?.intelligenceRunTotalCost,
    ) ||
    compareOptionalAsc(
      left.benchmarks.llm?.autoClose?.costPer1000Aud,
      right.benchmarks.llm?.autoClose?.costPer1000Aud,
    ) ||
    compareOptionalAsc(
      autoCloseTokenLoad(left.benchmarks.llm?.autoClose),
      autoCloseTokenLoad(right.benchmarks.llm?.autoClose),
    )
  );
}

function compareCustomerSupportTierTieBreak(
  left: BenchmarkCandidate,
  right: BenchmarkCandidate,
  tier: Tier,
): number {
  if (tier === "best") {
    return (
      compareOptionalDesc(
        left.benchmarks.llm?.autoClose?.weightedScore,
        right.benchmarks.llm?.autoClose?.weightedScore,
      ) ||
      compareOptionalDesc(
        left.benchmarks.llm?.intelligence,
        right.benchmarks.llm?.intelligence,
      )
    );
  }

  if (tier === "fast") {
    return (
      compareOptionalDesc(
        left.benchmarks.llm?.speed,
        right.benchmarks.llm?.speed,
      ) ||
      compareOptionalAsc(
        candidateCheapestPrice(left),
        candidateCheapestPrice(right),
      )
    );
  }

  return (
    compareOptionalDesc(
      left.benchmarks.llm?.autoClose?.weightedScore,
      right.benchmarks.llm?.autoClose?.weightedScore,
    ) ||
    compareOptionalAsc(
      candidateCheapestPrice(left),
      candidateCheapestPrice(right),
    )
  );
}

function autoCloseFalsePositiveRate(
  signals: AutoCloseBenchmarkSignals,
): number {
  return signals.total > 0 ? signals.falsePositiveCount / signals.total : 1;
}

function autoCloseTokenLoad(
  signals: AutoCloseBenchmarkSignals | undefined,
): number | undefined {
  if (!signals) return undefined;
  return signals.avgInputTokens + signals.avgOutputTokens;
}

function compareBenchmarkCandidateForTier(
  left: BenchmarkCandidate,
  right: BenchmarkCandidate,
  tier: Tier,
): number {
  if (tier === "best") {
    return (
      candidateDateValue(right.releaseDate) -
        candidateDateValue(left.releaseDate) ||
      (right.contextWindow ?? 0) - (left.contextWindow ?? 0) ||
      candidateCheapestPrice(right) - candidateCheapestPrice(left) ||
      left.id.localeCompare(right.id)
    );
  }

  if (tier === "balanced") {
    return (
      candidateCheapestPrice(left) - candidateCheapestPrice(right) ||
      (right.contextWindow ?? 0) - (left.contextWindow ?? 0) ||
      candidateDateValue(right.releaseDate ?? right.updatedAt) -
        candidateDateValue(left.releaseDate ?? left.updatedAt) ||
      left.id.localeCompare(right.id)
    );
  }

  return (
    candidateCheapestPrice(left) - candidateCheapestPrice(right) ||
    left.id.localeCompare(right.id)
  );
}

function scoreBenchmarkCandidate(
  candidate: BenchmarkCandidate,
  filters: ModelFilters,
  tier: Tier,
): number {
  const useCase = filters.useCase;
  if (!useCase) return 0;

  const signals = candidate.benchmarks.llm;
  const quality = benchmarkCandidateQualityScore(candidate, useCase);
  const latency = benchmarkCandidateLatencyScore(candidate, useCase);
  const speed = speedScore(signals);
  const context = Math.min((candidate.contextWindow ?? 0) / 1_000_000, 1) * 100;
  const cost = benchmarkCandidateCostScore(candidate, useCase, tier);
  const weights = scoringWeights(useCase, tier);
  const baseScore =
    quality * weights.quality +
    latency * weights.latency +
    speed * weights.speed +
    context * weights.context +
    cost * weights.cost;

  return baseScore;
}

function benchmarkCandidateQualityScore(
  candidate: BenchmarkCandidate,
  useCase: UseCase,
): number {
  if (useCase === "voice") {
    const voice = candidate.benchmarks.voice;
    return (
      ((voice?.agenticPerformance ?? 0) * 0.45 +
        (voice?.speechReasoning ?? 0) * 0.35 +
        (voice?.telecomAgenticPerformance ?? 0) * 0.15 +
        (voice?.conversationalDynamics ?? 0) * 0.05) *
      100
    );
  }

  if (useCase === "speech-to-text") {
    const aaWer = candidate.benchmarks.speechToText?.aaWer;
    return aaWer === undefined
      ? 0
      : 100 - Math.min(Math.max(aaWer, 0) / 20, 1) * 100;
  }

  const signals = candidate.benchmarks.llm;
  if (useCase === "customer-support") {
    const rankScore =
      signals?.customerSupportRank === undefined
        ? undefined
        : Math.max(0, 102 - signals.customerSupportRank * 2);
    const signalScore = weightedAverage(
      [
        [signals?.agentic ?? signals?.tauTelecom, 0.25],
        [signals?.instructionFollowing, 0.3],
        [signals?.intelligence, 0.25],
        [signals?.professional, 0.1],
      ],
      60,
    );
    return weightedAverage(
      [
        [rankScore, 0.65],
        [signalScore, 0.35],
      ],
      signalScore,
    );
  }

  return weightedAverage(
    [
      [signals?.instructionFollowing, 0.3],
      [signals?.intelligence, 0.3],
      [signals?.professional, 0.2],
      [signals?.coding, 0.1],
      [signals?.terminalBench, 0.1],
    ],
    60,
  );
}

function benchmarkCandidateLatencyScore(
  candidate: BenchmarkCandidate,
  useCase: UseCase,
): number {
  if (useCase === "voice") {
    const ttfa = candidate.benchmarks.voice?.timeToFirstAudioSeconds;
    if (ttfa !== undefined) return 100 - Math.min(ttfa / 5, 1) * 100;
  }

  if (useCase === "speech-to-text") {
    return speedScore({
      speed: candidate.benchmarks.speechToText?.speedFactor,
    });
  }

  const latency = candidate.benchmarks.llm?.latency;
  if (latency === undefined) return 50;
  return 100 - Math.min(latency / 20, 1) * 100;
}

function benchmarkCandidateCostScore(
  candidate: BenchmarkCandidate,
  useCase: UseCase,
  tier: Tier,
): number {
  if (useCase === "voice") {
    const cost = candidateVoiceCost(candidate);
    return cost === undefined
      ? 0
      : 100 - Math.min(Math.log1p(cost) / Math.log1p(20), 1) * 100;
  }

  if (useCase === "speech-to-text") {
    const cost = candidateTranscriptionCost(candidate);
    return cost === undefined
      ? 0
      : 100 - Math.min(Math.log1p(cost) / Math.log1p(20), 1) * 100;
  }

  return costScore(
    {
      pricing: candidate.pricing,
    } as RegistryModel,
    useCase,
    candidate.benchmarks.llm,
    tier,
  );
}

function scoreRecommendation(
  model: RegistryModel,
  filters: ModelFilters,
  catalog: Catalog,
  tier: Tier,
): number {
  const useCase = filters.useCase;
  if (!useCase) return 0;

  const signals =
    model.benchmarks?.llm ?? catalog.benchmarkSignals?.[modelKey(model)];
  const quality = qualityScore(model, signals, useCase);
  const latency = latencyScore(signals, model, useCase);
  const speed = speedScore(signals);
  const context = contextScore(model);
  const cost = costScore(model, useCase, signals, tier);
  const weights = scoringWeights(useCase, tier);

  return (
    quality * weights.quality +
    latency * weights.latency +
    speed * weights.speed +
    context * weights.context +
    cost * weights.cost
  );
}

function scoringWeights(
  useCase: UseCase,
  tier: Tier,
): {
  quality: number;
  latency: number;
  speed: number;
  context: number;
  cost: number;
} {
  if (tier === "fast") {
    if (useCase === "voice") {
      return { quality: 0.15, latency: 0.45, speed: 0, context: 0, cost: 0.4 };
    }
    if (useCase === "speech-to-text") {
      return { quality: 0.2, latency: 0, speed: 0.35, context: 0, cost: 0.45 };
    }
    return { quality: 0.2, latency: 0.04, speed: 0.04, context: 0, cost: 0.72 };
  }

  if (tier === "best") {
    if (useCase === "voice") {
      return { quality: 0.9, latency: 0.05, speed: 0, context: 0, cost: 0.05 };
    }
    if (useCase === "speech-to-text") {
      return { quality: 0.85, latency: 0, speed: 0.1, context: 0, cost: 0.05 };
    }
    return { quality: 0.9, latency: 0.02, speed: 0.02, context: 0, cost: 0.06 };
  }

  if (useCase === "voice") {
    return { quality: 0.45, latency: 0.2, speed: 0, context: 0, cost: 0.35 };
  }
  if (useCase === "speech-to-text") {
    return { quality: 0.65, latency: 0, speed: 0.1, context: 0, cost: 0.25 };
  }

  return { quality: 0.54, latency: 0.04, speed: 0.04, context: 0, cost: 0.38 };
}

function qualityScore(
  model: RegistryModel,
  signals: BenchmarkSignals | undefined,
  useCase: UseCase,
): number {
  const fallback = familyQualityFallback(model);
  if (useCase === "voice") {
    const voice = model.benchmarks?.voice;
    return (
      ((voice?.agenticPerformance ?? 0) * 0.45 +
        (voice?.speechReasoning ?? 0) * 0.35 +
        (voice?.telecomAgenticPerformance ?? 0) * 0.15 +
        (voice?.conversationalDynamics ?? 0) * 0.05) *
      100
    );
  }

  if (useCase === "speech-to-text") {
    const aaWer = model.benchmarks?.speechToText?.aaWer;
    return aaWer === undefined
      ? fallback
      : 100 - Math.min(Math.max(aaWer, 0) / 20, 1) * 100;
  }

  if (!signals) return fallback;

  if (useCase === "customer-support") {
    return weightedAverage(
      [
        [signals.agentic ?? signals.tauTelecom, 0.25],
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
  if (
    family.includes("sonnet") ||
    family === "gpt" ||
    family.includes("grok")
  ) {
    return 78;
  }
  if (family.includes("mini") || family.includes("flash")) return 68;
  if (family.includes("haiku") || family.includes("nano")) return 58;
  return 62;
}

function latencyScore(
  signals: BenchmarkSignals | undefined,
  model?: RegistryModel,
  useCase?: UseCase,
): number {
  if (useCase === "voice") {
    const ttfa = model?.benchmarks?.voice?.timeToFirstAudioSeconds;
    if (ttfa !== undefined) return 100 - Math.min(ttfa / 5, 1) * 100;
  }

  if (useCase === "speech-to-text") {
    return speedScore({ speed: model?.benchmarks?.speechToText?.speedFactor });
  }

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

function costScore(
  model: RegistryModel,
  useCase?: UseCase,
  signals?: BenchmarkSignals,
  tier: Tier = "balanced",
): number {
  if (useCase === "voice") {
    const cost = voiceCost(model);
    return cost === undefined
      ? 0
      : 100 - Math.min(Math.log1p(cost) / Math.log1p(20), 1) * 100;
  }

  if (useCase === "speech-to-text") {
    const cost = transcriptionCost(model);
    return cost === undefined
      ? 0
      : 100 - Math.min(Math.log1p(cost) / Math.log1p(20), 1) * 100;
  }

  const outputWeight = useCase === "customer-support" ? 0.6 : 0.25;
  const inputWeight = 1 - outputWeight;
  const blended =
    (model.pricing.inputPerMTok ?? 100) * inputWeight +
    (model.pricing.outputPerMTok ?? 100) * outputWeight;
  const priceScore =
    100 - Math.min(Math.log1p(blended) / Math.log1p(100), 1) * 100;
  const runCostScore = benchmarkRunCostScore(signals);
  const outputTokenScore = benchmarkOutputTokenScore(signals);

  if (useCase === "customer-support") {
    if (tier === "fast") {
      return weightedAverage(
        [
          [runCostScore, 0.75],
          [priceScore, 0.15],
          [outputTokenScore, 0.1],
        ],
        priceScore,
      );
    }

    if (tier === "best") {
      return weightedAverage(
        [
          [runCostScore, 0.45],
          [priceScore, 0.25],
          [outputTokenScore, 0.3],
        ],
        priceScore,
      );
    }

    return weightedAverage(
      [
        [runCostScore, 0.55],
        [priceScore, 0.2],
        [outputTokenScore, 0.25],
      ],
      priceScore,
    );
  }

  return priceScore;
}

function benchmarkRunCostScore(
  signals: BenchmarkSignals | undefined,
): number | undefined {
  const cost = signals?.intelligenceRunTotalCost;
  if (cost === undefined) return undefined;
  return 100 - Math.min(Math.log1p(cost) / Math.log1p(8_000), 1) * 100;
}

function benchmarkOutputTokenScore(
  signals: BenchmarkSignals | undefined,
): number | undefined {
  const tokens = signals?.intelligenceRunOutputTokens;
  if (tokens === undefined) return undefined;
  return 100 - Math.min(Math.log1p(tokens) / Math.log1p(250_000_000), 1) * 100;
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

function compareOptionalAsc(
  left: number | undefined,
  right: number | undefined,
): number {
  if (left === undefined && right === undefined) return 0;
  if (left === undefined) return 1;
  if (right === undefined) return -1;
  return left - right;
}

function compareOptionalDesc(
  left: number | undefined,
  right: number | undefined,
): number {
  return compareOptionalAsc(right, left);
}

function compareCheapest(left: RegistryModel, right: RegistryModel): number {
  return (
    cheapestPrice(left) - cheapestPrice(right) || compareNewest(left, right)
  );
}

function cheapestPrice(model: RegistryModel): number {
  return (
    model.pricing.inputPerMTok ??
    voiceCost(model) ??
    transcriptionCost(model) ??
    model.pricing.outputPerMTok ??
    Number.POSITIVE_INFINITY
  );
}

function voiceCost(model: RegistryModel): number | undefined {
  const input = audioInputCost(model);
  const output = audioOutputCost(model);
  if (input !== undefined && output !== undefined)
    return input * 0.6 + output * 0.4;
  return input ?? output;
}

function audioInputCost(model: RegistryModel): number | undefined {
  return model.pricing.benchmarkInputAudioPerHour;
}

function audioOutputCost(model: RegistryModel): number | undefined {
  return model.pricing.audioOutputPerHour ?? audioInputCost(model);
}

function hasPositiveAudioPrice(model: RegistryModel): boolean {
  const input = audioInputCost(model);
  const output = audioOutputCost(model);
  return (
    (input !== undefined && input > 0) || (output !== undefined && output > 0)
  );
}

function transcriptionCost(model: RegistryModel): number | undefined {
  return model.pricing.transcriptionCostPer1kMinutes;
}

function candidateVoiceCost(candidate: BenchmarkCandidate): number | undefined {
  const input = candidate.pricing.benchmarkInputAudioPerHour;
  const output = candidateAudioOutputCost(candidate);
  if (input !== undefined && output !== undefined)
    return input * 0.6 + output * 0.4;
  return input ?? output;
}

function candidateAudioOutputCost(
  candidate: BenchmarkCandidate,
): number | undefined {
  return (
    candidate.pricing.audioOutputPerHour ??
    candidate.pricing.benchmarkInputAudioPerHour
  );
}

function hasPositiveCandidateAudioPrice(pricing: ModelPricing): boolean {
  const input = pricing.benchmarkInputAudioPerHour;
  const output = pricing.audioOutputPerHour ?? input;
  return (
    (input !== undefined && input > 0) || (output !== undefined && output > 0)
  );
}

function candidateTranscriptionCost(
  candidate: BenchmarkCandidate,
): number | undefined {
  return candidate.pricing.transcriptionCostPer1kMinutes;
}

function candidateCheapestPrice(candidate: BenchmarkCandidate): number {
  return (
    candidate.pricing.inputPerMTok ??
    candidateVoiceCost(candidate) ??
    candidateTranscriptionCost(candidate) ??
    candidate.pricing.outputPerMTok ??
    Number.POSITIVE_INFINITY
  );
}

function candidateDateValue(value: string | null | undefined): number {
  return value ? dateValue(value) : 0;
}

function compareNewest(left: RegistryModel, right: RegistryModel): number {
  return (
    dateValue(right.releaseDate) - dateValue(left.releaseDate) ||
    dateValue(right.updatedAt) - dateValue(left.updatedAt)
  );
}

function modelKey(model: RegistryModel): string {
  return `${model.provider}:${model.id}`;
}

function asFiniteNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function slugFrom(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function modelSlugName(name: string, providerName: string | undefined): string {
  if (!providerName) return name;
  return name.replace(
    new RegExp(`,\\s*${escapeRegExp(providerName)}$`, "i"),
    "",
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function optionalTokenPrice(
  key: "inputPerMTok" | "outputPerMTok" | "cacheReadPerMTok",
  value: number | undefined,
): Partial<ModelPricing> {
  return value === undefined ? {} : { [key]: value };
}

function optionalNumberPrice(
  key:
    | "audioInputPerHour"
    | "audioOutputPerHour"
    | "benchmarkInputAudioPerHour"
    | "benchmarkCostPerTask"
    | "transcriptionCostPer1kMinutes",
  value: number | undefined,
): Partial<ModelPricing> {
  return value === undefined ? {} : { [key]: value };
}

function optionalBenchmark<
  K extends keyof Omit<VoiceBenchmarks, "source" | "extractedAt">,
>(
  key: K,
  value: number | undefined,
): Pick<VoiceBenchmarks, K> | Record<string, never> {
  return value === undefined
    ? {}
    : ({ [key]: value } as Pick<VoiceBenchmarks, K>);
}

function optionalSpeechToTextBenchmark<
  K extends keyof Omit<
    SpeechToTextBenchmarks,
    "source" | "extractedAt" | "hostingProviderName" | "hostingProviderSlug"
  >,
>(
  key: K,
  value: number | undefined,
): Pick<SpeechToTextBenchmarks, K> | Record<string, never> {
  return value === undefined
    ? {}
    : ({ [key]: value } as Pick<SpeechToTextBenchmarks, K>);
}

function positiveNumberOrUndefined(
  value: number | undefined,
): number | undefined {
  return value === undefined || value <= 0 ? undefined : value;
}

function nonNegativeNumberOrUndefined(
  value: number | undefined,
): number | undefined {
  return value === undefined || value < 0 ? undefined : value;
}

function hasTokenPricing(pricing: ModelPricing): boolean {
  return (
    pricing.inputPerMTok !== undefined &&
    pricing.inputPerMTok > 0 &&
    pricing.outputPerMTok !== undefined &&
    pricing.outputPerMTok > 0
  );
}

function isNumber(value: number | undefined): value is number {
  return typeof value === "number";
}

function convertPricing(
  pricing: ModelPricing,
  exchangeRate: ExchangeRate,
): ModelPricing {
  return {
    ...optionalAudPrice(
      "inputPerMTok",
      pricing.inputPerMTok,
      exchangeRate.rate,
    ),
    ...optionalAudPrice(
      "outputPerMTok",
      pricing.outputPerMTok,
      exchangeRate.rate,
    ),
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
    ...optionalAudPrice(
      "audioInputPerHour",
      pricing.audioInputPerHour,
      exchangeRate.rate,
    ),
    ...optionalAudPrice(
      "audioOutputPerHour",
      pricing.audioOutputPerHour,
      exchangeRate.rate,
    ),
    ...optionalAudPrice(
      "benchmarkInputAudioPerHour",
      pricing.benchmarkInputAudioPerHour,
      exchangeRate.rate,
    ),
    ...optionalAudPrice(
      "benchmarkCostPerTask",
      pricing.benchmarkCostPerTask,
      exchangeRate.rate,
    ),
    ...optionalAudPrice(
      "transcriptionCostPer1kMinutes",
      pricing.transcriptionCostPer1kMinutes,
      exchangeRate.rate,
    ),
  };
}

function optionalAudPrice(
  key: keyof ModelPricing,
  value: number | undefined,
  rate: number,
): Partial<ModelPricing> {
  return value === undefined ? {} : { [key]: audValue(value, rate) };
}

function audValue(value: number, rate: number): number {
  return Number((value * rate).toFixed(6));
}

function audValueOrUndefined(
  value: number | undefined,
  rate: number,
): number | undefined {
  return value === undefined ? undefined : audValue(value, rate);
}

function optionalString<K extends "releaseDate" | "knowledgeCutoff">(
  key: K,
  value: unknown,
): Pick<RegistryModel, K> | Record<string, never> {
  return typeof value === "string" && value.trim()
    ? ({ [key]: value.trim() } as Pick<RegistryModel, K>)
    : {};
}

function dateValue(value: string | undefined): number {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}
