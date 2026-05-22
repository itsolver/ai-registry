import { describe, expect, it } from "vitest";
import { handleRequest, isAuthorized, type Env } from "../src/worker";
import { artificialAnalysisFixture } from "./fixtures";

interface JsonObject {
  [key: string]: any;
}

const fxUrl =
  "data:application/json," +
  encodeURIComponent(
    JSON.stringify({ amount: 1, base: "USD", date: "2026-05-19", rates: { AUD: 1.5 } }),
  );
const artificialAnalysisUrl =
  "data:application/json," +
  encodeURIComponent(JSON.stringify(artificialAnalysisFixture));

function env(): Env {
  return {
    MODEL_REGISTRY_API_KEY: "test-secret",
    ALLOWED_IPS: "203.12.1.95",
    FX_RATE_URL: fxUrl,
    ARTIFICIAL_ANALYSIS_API_KEY: "aa-secret",
    ARTIFICIAL_ANALYSIS_LLM_URL: artificialAnalysisUrl,
  };
}

const ctx = {
  waitUntil(_promise: Promise<unknown>) {
    return undefined;
  },
};

describe("auth", () => {
  it("allows bearer tokens", () => {
    const request = new Request("https://ai.itsolver.au/v1/health", {
      headers: { Authorization: "Bearer test-secret" },
    });

    expect(isAuthorized(request, env())).toBe(true);
  });

  it("allows the configured WAN IP", () => {
    const request = new Request("https://ai.itsolver.au/v1/health", {
      headers: { "CF-Connecting-IP": "203.12.1.95" },
    });

    expect(isAuthorized(request, env())).toBe(true);
  });

  it("rejects unauthenticated requests", () => {
    const request = new Request("https://ai.itsolver.au/v1/health");

    expect(isAuthorized(request, env())).toBe(false);
  });

  it("allows localhost requests for local development", () => {
    const request = new Request("http://localhost:8787/v1/health");

    expect(isAuthorized(request, env())).toBe(true);
  });

  it("allows explicit local development auth bypass", () => {
    const request = new Request("https://ai.itsolver.au/v1/health");

    expect(isAuthorized(request, { ...env(), LOCAL_DEV_AUTH_BYPASS: "true" })).toBe(
      true,
    );
  });
});

describe("worker routes", () => {
  it("protects the homepage", async () => {
    const response = await handleRequest(
      new Request("https://ai.itsolver.au/"),
      env(),
      ctx,
    );

    expect(response.status).toBe(401);
  });

  it("serves the homepage for the allowlisted IP", async () => {
    const response = await handleRequest(
      new Request("https://ai.itsolver.au/", {
        headers: { "CF-Connecting-IP": "203.12.1.95" },
      }),
      env(),
      ctx,
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("ai<span class=\"blink\">.</span>itsolver");
  });

  it("serves health metadata", async () => {
    const response = await handleRequest(
      new Request("https://ai.itsolver.au/v1/health", {
        headers: { Authorization: "Bearer test-secret" },
      }),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: "ok",
      apiVersion: "v1",
      pricingCurrency: "AUD",
      sourcePricingCurrency: "USD",
      exchangeRate: {
        base: "USD",
        quote: "AUD",
        rate: 1.5,
      },
      providerCount: 4,
    });
    expect(body.modelCount).toBeGreaterThanOrEqual(9);
    expect(body.activeModelCount).toBeGreaterThanOrEqual(8);
  });

  it("requires a use case for AA-only recommendations", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?provider=openai&tier=best",
        {
          headers: { Authorization: "Bearer test-secret" },
        },
      ),
      env(),
      ctx,
    );

    expect(response.status).toBe(404);
  });

  it("uses useCase for benchmark-aware recommendations", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?provider=xai&useCase=customer-support",
        {
          headers: { Authorization: "Bearer test-secret" },
        },
      ),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      pricingCurrency: "AUD",
      sourcePricingCurrency: "USD",
      exchangeRate: {
        rate: 1.5,
      },
    });
    expect(body.recommendation).toMatchObject({
      provider: "xai",
      recommendable: true,
      source: "artificialanalysis",
    });
    expect(body.recommendation.pricing.inputPerMTok).toBeGreaterThan(0);
    expect(body.recommendation.pricing.outputPerMTok).toBeGreaterThan(0);
    expect(body.recommendation.benchmarkSignals).toBeUndefined();
  });

  it("serves recommendable AA benchmark rows without registry joins", async () => {
    const response = await handleRequest(
      new Request("https://ai.itsolver.au/v1/benchmarks?useCase=customer-support", {
        headers: { Authorization: "Bearer test-secret" },
      }),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      pricingCurrency: "AUD",
      sourcePricingCurrency: "USD",
      exchangeRate: {
        rate: 1.5,
      },
    });
    expect(body.benchmarks.map((row: { id: string }) => row.id)).not.toContain(
      "gemini-2.0-flash-lite",
    );
    expect(
      body.benchmarks.some((row: { recommendable: boolean }) => !row.recommendable),
    ).toBe(false);
    expect(body.benchmarks).toContainEqual(
      expect.objectContaining({
        id: "grok-4-3",
        recommendable: true,
        pricing: expect.objectContaining({
          inputPerMTok: 1.875,
          outputPerMTok: 3.75,
        }),
      }),
    );
  });

  it("can recommend AA-origin rows with real token pricing", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?provider=xai&useCase=customer-support&tier=best",
        {
          headers: { Authorization: "Bearer test-secret" },
        },
      ),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.recommendation).toMatchObject({
      provider: "xai",
      recommendable: true,
      pricing: expect.objectContaining({
        inputPerMTok: expect.any(Number),
        outputPerMTok: expect.any(Number),
      }),
    });
    expect(body.recommendation.registryModelId).toBeUndefined();
  });

  it("hard-filters customer support rows by Run AUD range", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/benchmarks?useCase=customer-support&minRunCostAud=100&maxRunCostAud=500",
        {
          headers: { Authorization: "Bearer test-secret" },
        },
      ),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.benchmarks.length).toBeGreaterThan(0);
    expect(
      body.benchmarks.every(
        (row: { benchmarks: { llm?: { intelligenceRunTotalCost?: number } } }) =>
          (row.benchmarks.llm?.intelligenceRunTotalCost ?? Number.NEGATIVE_INFINITY) >=
            100 &&
          (row.benchmarks.llm?.intelligenceRunTotalCost ?? Number.POSITIVE_INFINITY) <=
            500,
      ),
    ).toBe(true);
  });

  it("uses customer-support priority tiers for OpenAI recommendations", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?provider=openai&useCase=customer-support",
        {
          headers: { Authorization: "Bearer test-secret" },
        },
      ),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.recommendation).toMatchObject({
      id: "gpt-5-4-low",
      provider: "openai",
      pricing: expect.objectContaining({
        inputPerMTok: 3.75,
        outputPerMTok: 22.5,
      }),
      benchmarks: {
        llm: expect.objectContaining({
          customerSupportRank: 6,
          autoClose: expect.objectContaining({
            falsePositiveCount: 6,
            verifiedOn: "2026-05-21",
          }),
        }),
      },
    });

    const bestResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?provider=openai&useCase=customer-support&tier=best",
        {
          headers: { Authorization: "Bearer test-secret" },
        },
      ),
      env(),
      ctx,
    );
    const bestBody = (await bestResponse.json()) as JsonObject;

    expect(bestResponse.status).toBe(200);
    expect(bestBody.recommendation).toMatchObject({
      id: "gpt-5-4-low",
      provider: "openai",
      benchmarks: {
        llm: expect.objectContaining({
          customerSupportRank: 6,
          autoClose: expect.objectContaining({
            falsePositiveCount: 6,
          }),
        }),
      },
    });
  });

  it("mirrors unprefixed model endpoints", async () => {
    const response = await handleRequest(
      new Request("https://ai.itsolver.au/models/providers", {
        headers: { Authorization: "Bearer test-secret" },
      }),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.providers.map((provider: { provider: string }) => provider.provider)).toEqual([
      "openai",
      "google",
      "xai",
      "anthropic",
    ]);
  });

  it("does not serve the old static registry URLs", async () => {
    const response = await handleRequest(
      new Request("https://ai.itsolver.au/models.json", {
        headers: { Authorization: "Bearer test-secret" },
      }),
      env(),
      ctx,
    );

    expect(response.status).toBe(404);
  });
});
