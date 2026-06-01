import { describe, expect, it } from "vitest";
import { handleRequest, type Env } from "../src/worker";
import {
  artificialAnalysisFixture,
  artificialAnalysisSpeechToTextFixture,
} from "./fixtures";

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
const artificialAnalysisSttUrl =
  "data:application/json," +
  encodeURIComponent(JSON.stringify(artificialAnalysisSpeechToTextFixture));

function env(): Env {
  return {
    FX_RATE_URL: fxUrl,
    ARTIFICIAL_ANALYSIS_API_KEY: "aa-secret",
    ARTIFICIAL_ANALYSIS_LLM_URL: artificialAnalysisUrl,
    ARTIFICIAL_ANALYSIS_STT_URL: artificialAnalysisSttUrl,
  };
}

const ctx = {
  waitUntil(_promise: Promise<unknown>) {
    return undefined;
  },
};

describe("worker routes", () => {
  it("serves the homepage without auth", async () => {
    const response = await handleRequest(
      new Request("https://ai.itsolver.au/"),
      env(),
      ctx,
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("ai<span class=\"blink\">.</span>itsolver");
  });

  it("serves health metadata", async () => {
    const response = await handleRequest(
      new Request("https://ai.itsolver.au/v1/health"),
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
      providerCount: 7,
    });
    expect(body.modelCount).toBeGreaterThanOrEqual(9);
    expect(body.activeModelCount).toBeGreaterThanOrEqual(8);
  });

  it("requires a use case for AA-only recommendations", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?provider=openai&tier=best",
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
      new Request("https://ai.itsolver.au/v1/benchmarks?useCase=customer-support"),
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

  it("serves speech-to-text benchmark rows", async () => {
    const response = await handleRequest(
      new Request("https://ai.itsolver.au/v1/benchmarks?useCase=speech-to-text"),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.benchmarks).toContainEqual(
      expect.objectContaining({
        id: "elevenlabs-scribe-v2",
        provider: "elevenlabs",
        recommendable: true,
        pricing: expect.objectContaining({
          transcriptionCostPer1kMinutes: 7.5,
        }),
        benchmarks: {
          speechToText: expect.objectContaining({
            aaWer: 2.2,
            source: "artificialanalysis",
          }),
        },
      }),
    );
    expect(
      body.benchmarks.some((row: { id: string }) => row.id.includes("missing")),
    ).toBe(false);
  });

  it("serves speech-to-text browse rows", async () => {
    const response = await handleRequest(
      new Request("https://ai.itsolver.au/v1/models?useCase=speech-to-text"),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.models).toContainEqual(
      expect.objectContaining({
        id: "nvidia-parakeet-tdt-0-6b-v3-togetherai",
        provider: "nvidia",
        benchmarks: {
          speechToText: expect.objectContaining({
            hostingProviderName: "Together.ai",
          }),
        },
      }),
    );
  });

  it("recommends NVIDIA, ElevenLabs, and Groq speech-to-text rows", async () => {
    const nvidiaResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=speech-to-text&provider=nvidia",
      ),
      env(),
      ctx,
    );
    const nvidiaBody = (await nvidiaResponse.json()) as JsonObject;
    const elevenLabsResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=speech-to-text&provider=elevenlabs",
      ),
      env(),
      ctx,
    );
    const elevenLabsBody = (await elevenLabsResponse.json()) as JsonObject;
    const groqResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=speech-to-text&provider=groq",
      ),
      env(),
      ctx,
    );
    const groqBody = (await groqResponse.json()) as JsonObject;

    expect(nvidiaResponse.status).toBe(200);
    expect(nvidiaBody.recommendation).toMatchObject({
      id: "nvidia-parakeet-tdt-0-6b-v3-togetherai",
      provider: "nvidia",
    });
    expect(elevenLabsResponse.status).toBe(200);
    expect(elevenLabsBody.recommendation).toMatchObject({
      id: "elevenlabs-scribe-v2",
      provider: "elevenlabs",
    });
    expect(groqResponse.status).toBe(200);
    expect(groqBody.recommendation).toMatchObject({
      id: "groq-whisper-large-v3-turbo",
      provider: "groq",
      pricing: expect.objectContaining({
        transcriptionCostPer1kMinutes: 1.005,
      }),
    });
  });

  it("mirrors unprefixed model endpoints", async () => {
    const response = await handleRequest(
      new Request("https://ai.itsolver.au/models/providers"),
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
      "nvidia",
      "elevenlabs",
      "groq",
    ]);
  });

  it("does not serve the old static registry URLs", async () => {
    const response = await handleRequest(
      new Request("https://ai.itsolver.au/models.json"),
      env(),
      ctx,
    );

    expect(response.status).toBe(404);
  });
});
