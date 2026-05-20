import { describe, expect, it } from "vitest";
import { handleRequest, isAuthorized, type Env } from "../src/worker";
import { artificialAnalysisFixture, modelsDevFixture } from "./fixtures";

interface JsonObject {
  [key: string]: any;
}

const sourceUrl =
  "data:application/json," + encodeURIComponent(JSON.stringify(modelsDevFixture));
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
    MODELS_DEV_URL: sourceUrl,
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
      providerCount: 4,
      modelCount: 10,
      activeModelCount: 9,
    });
  });

  it("serves filtered model recommendations", async () => {
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
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.recommendation.id).toBe("gpt-expensive");
    expect(body.exchangeRate).toBeUndefined();
    expect(body.recommendation.pricing).toMatchObject({
      inputPerMTok: 18,
      outputPerMTok: 90,
    });
    expect(body.recommendation.pricingAud).toBeUndefined();
  });

  it("uses useCase and careLevel for benchmark-aware recommendations", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?provider=openai&useCase=coding&careLevel=premium",
        {
          headers: { Authorization: "Bearer test-secret" },
        },
      ),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.recommendation.id).toBe("gpt-expensive");
    expect(body.recommendation.benchmarkSignals).toBeUndefined();
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
