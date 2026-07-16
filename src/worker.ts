import { HOME_HTML } from "./html";
import { ITS_BENCHMARK_HTML } from "./its-benchmark";
import { WEBDEV_BENCHMARK_HTML } from "./webdev-benchmark";
import {
  asProvider,
  benchmarkCandidateEligibilityReason,
  benchmarkCandidates,
  filterModels,
  isBenchmarkCandidateRecommendedForFilters,
  latestForProvider,
  normalizeModelsDevCatalog,
  parseFilters,
  recommendationFamilyKey,
  recommendModelFailovers,
  rankedRecommendedModels,
  type ArtificialAnalysisModel,
  type ArtificialAnalysisSpeechToTextModel,
  type Catalog,
  type ExchangeRate,
  type ModelsDevDocument,
  type ProviderId,
  type RecommendedModel,
} from "./registry";

const CACHE_KEY = "catalog:v28";
const CACHE_TTL_MS = 8 * 60 * 60 * 1000;
const CACHE_TTL_SECONDS = CACHE_TTL_MS / 1000;
const DEFAULT_FX_RATE_URL =
  "https://api.frankfurter.dev/v1/latest?base=USD&symbols=AUD";
const DEFAULT_MODELS_DEV_URL = "https://models.dev/api.json";
const DEFAULT_ARTIFICIAL_ANALYSIS_LLM_URL =
  "https://artificialanalysis.ai/api/v2/data/llms/models";
const DEFAULT_ARTIFICIAL_ANALYSIS_FREE_LLM_URL =
  "https://artificialanalysis.ai/api/v2/language/models/free";
const DEFAULT_ARTIFICIAL_ANALYSIS_STT_URL =
  "https://artificialanalysis.ai/api/v2/media/speech-to-text/models";
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
    ctx.waitUntil(refreshCatalog(env));
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
  const cached = await readCachedCatalog(env);
  const catalog = await fetchCatalog(env);
  assertProviderCoverage(catalog, cached);
  await writeCachedCatalog(env, catalog);
  return catalog;
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

function catalogResponseMetadata(catalog: Catalog): Record<string, unknown> {
  return {
    generatedAt: catalog.generatedAt,
    pricingCurrency: catalog.exchangeRate?.quote ?? "USD",
    sourcePricingCurrency: catalog.exchangeRate?.base ?? "USD",
    ...(catalog.exchangeRate ? { exchangeRate: catalog.exchangeRate } : {}),
  };
}

async function getCatalog(
  env: Env,
  ctx?: Pick<ExecutionContext, "waitUntil">,
): Promise<Catalog> {
  const cached = await readCachedCatalog(env);
  if (cached && isFresh(cached)) return cached;

  try {
    const catalog = await fetchCatalog(env);
    assertProviderCoverage(catalog, cached);
    const write = writeCachedCatalog(env, catalog);
    if (ctx) ctx.waitUntil(write);
    else await write;
    return catalog;
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
}

async function readCachedCatalog(env: Env): Promise<Catalog | undefined> {
  const value = await env.MODEL_CACHE?.get(CACHE_KEY);
  if (!value) return undefined;

  try {
    return JSON.parse(value) as Catalog;
  } catch {
    return undefined;
  }
}

async function writeCachedCatalog(env: Env, catalog: Catalog): Promise<void> {
  await env.MODEL_CACHE?.put(CACHE_KEY, JSON.stringify(catalog), {
    expirationTtl: CACHE_TTL_SECONDS,
  });
}

function assertProviderCoverage(
  catalog: Catalog,
  cached: Catalog | undefined,
): void {
  if (
    !cached ||
    !Array.isArray(cached.models) ||
    cached.models.length === 0 ||
    !Array.isArray(cached.providers)
  ) {
    return;
  }

  const currentProviders = new Set(
    catalog.providers
      .filter((provider) => provider.total > 0)
      .map((provider) => provider.provider),
  );
  const missingProvider = cached.providers.find(
    (provider) => provider.total > 0 && !currentProviders.has(provider.provider),
  );
  if (missingProvider) {
    throw new Error(
      `models.dev refresh dropped cached provider ${missingProvider.provider}`,
    );
  }
}

async function fetchCatalog(env: Env): Promise<Catalog> {
  const [
    modelsDev,
    exchangeRate,
    legacyArtificialAnalysisModels,
    currentArtificialAnalysisModels,
    artificialAnalysisSpeechToTextModels,
  ] = await Promise.all([
    fetchModelsDev(env),
    fetchUsdAudRate(env),
    fetchArtificialAnalysisModels(env),
    fetchArtificialAnalysisFreeModels(env),
    fetchArtificialAnalysisSpeechToTextModels(env),
  ]);

  return normalizeModelsDevCatalog(
    modelsDev,
    new Date().toISOString(),
    exchangeRate,
    [
      ...legacyArtificialAnalysisModels,
      ...currentArtificialAnalysisModels,
    ],
    artificialAnalysisSpeechToTextModels,
  );
}

async function fetchModelsDev(env: Env): Promise<ModelsDevDocument> {
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

async function fetchUsdAudRate(env: Env): Promise<ExchangeRate | undefined> {
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

function isFresh(catalog: Catalog): boolean {
  const generatedAt = Date.parse(catalog.generatedAt);
  if (!Number.isFinite(generatedAt)) return false;
  return Date.now() - generatedAt < CACHE_TTL_MS;
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
