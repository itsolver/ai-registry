import { HOME_HTML } from "./html";
import {
  asProvider,
  benchmarkCandidates,
  filterModels,
  latestForProvider,
  normalizeArtificialAnalysisCatalog,
  parseFilters,
  recommendModel,
  type ArtificialAnalysisModel,
  type Catalog,
  type ExchangeRate,
} from "./registry";

const CACHE_KEY = "catalog:v8";
const CACHE_TTL_MS = 8 * 60 * 60 * 1000;
const CACHE_TTL_SECONDS = CACHE_TTL_MS / 1000;
const DEFAULT_FX_RATE_URL =
  "https://api.frankfurter.dev/v1/latest?base=USD&symbols=AUD";
const DEFAULT_ARTIFICIAL_ANALYSIS_LLM_URL =
  "https://artificialanalysis.ai/api/v2/data/llms/models";
const DEFAULT_ALLOWED_IPS = "203.12.1.95";

export interface Env {
  MODEL_CACHE?: KVNamespace;
  MODEL_REGISTRY_API_KEY?: string;
  MODEL_REGISTRY_API_KEYS?: string;
  ALLOWED_IPS?: string;
  FX_RATE_URL?: string;
  ARTIFICIAL_ANALYSIS_API_KEY?: string;
  ARTIFICIAL_ANALYSIS_LLM_URL?: string;
  LOCAL_DEV_AUTH_BYPASS?: string;
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

  if (!isAuthorized(request, env)) {
    return jsonResponse(
      {
        error: "unauthorized",
        message: "Send a valid bearer token or request from an allowlisted IP.",
      },
      401,
    );
  }

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
          error instanceof Error ? error.message : "Unable to load model catalog.",
      },
      503,
    );
  }
}

export async function refreshCatalog(env: Env): Promise<Catalog> {
  const catalog = await fetchCatalog(env);
  await writeCachedCatalog(env, catalog);
  return catalog;
}

export function isAuthorized(request: Request, env: Env): boolean {
  if (env.LOCAL_DEV_AUTH_BYPASS === "true") return true;
  if (isLocalhostRequest(request)) return true;

  const allowedIps = splitList(env.ALLOWED_IPS || DEFAULT_ALLOWED_IPS);
  const connectingIp = request.headers.get("CF-Connecting-IP");
  if (connectingIp && allowedIps.includes(connectingIp)) return true;

  const token = bearerToken(request) || request.headers.get("x-api-key") || "";
  const keys = splitList(
    [env.MODEL_REGISTRY_API_KEY, env.MODEL_REGISTRY_API_KEYS]
      .filter(Boolean)
      .join(","),
  );

  return keys.some((key) => constantTimeEqual(key, token));
}

function isLocalhostRequest(request: Request): boolean {
  const hostname = new URL(request.url).hostname;
  const host = request.headers.get("Host")?.split(":")[0] ?? "";
  return isLocalhost(hostname) || isLocalhost(host);
}

function isLocalhost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
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
    });
  }

  if (route === "/models/providers") {
    return jsonResponse({
      ...catalogResponseMetadata(catalog),
      providers: catalog.providers,
    });
  }

  if (route === "/models/recommend") {
    const recommendation = recommendModel(catalog, parseFilters(params));
    if (!recommendation) {
      return jsonResponse(
        {
          error: "not_found",
          message: "No model matches the supplied filters.",
        },
        404,
      );
    }

    return jsonResponse({
      ...catalogResponseMetadata(catalog),
      recommendation,
    });
  }

  if (route === "/benchmarks") {
    const filters = parseFilters(params);
    const rows = benchmarkCandidates(catalog, filters).filter(
      (row) => !filters.useCase || row.recommendable,
    );
    return jsonResponse({
      ...catalogResponseMetadata(catalog),
      benchmarkCount: rows.length,
      benchmarks: rows,
    });
  }

  if (route === "/models") {
    const filters = parseFilters(params);
    const models = catalog.models.length
      ? filterModels(catalog.models, filters)
      : benchmarkCandidates(catalog, filters);
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

async function fetchCatalog(env: Env): Promise<Catalog> {
  const [exchangeRate, artificialAnalysisModels] = await Promise.all([
    fetchUsdAudRate(env),
    fetchArtificialAnalysisModels(env),
  ]);

  return normalizeArtificialAnalysisCatalog(
    new Date().toISOString(),
    exchangeRate,
    artificialAnalysisModels,
  );
}

async function fetchArtificialAnalysisModels(
  env: Env,
): Promise<ArtificialAnalysisModel[]> {
  if (!env.ARTIFICIAL_ANALYSIS_API_KEY) return [];

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
  return Array.isArray(data.data) ? (data.data as ArtificialAnalysisModel[]) : [];
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

  if (data.base !== "USD" || typeof rate !== "number" || !Number.isFinite(rate)) {
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

function bearerToken(request: Request): string | undefined {
  const header = request.headers.get("Authorization");
  const match = header?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim();
}

function splitList(value: string): string[] {
  return value
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function constantTimeEqual(left: string, right: string): boolean {
  if (!left || !right || left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

function htmlResponse(html: string): Response {
  return new Response(html, {
    headers: {
      ...commonHeaders(),
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, max-age=300",
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
      "cache-control": "private, max-age=300",
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
      "access-control-allow-headers": "authorization, content-type, x-api-key",
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
