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
    const html = await response.text();
    expect(html).toContain("ai<span class=\"blink\">.</span>itsolver");
    expect(html).toContain("Bench Telecom");
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
        "https://ai.itsolver.au/v1/benchmarks?useCase=customer-support&includeItsBenchmark=false&minRunCostAud=100&maxRunCostAud=1500",
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
            1500,
      ),
    ).toBe(true);
  });

  it("hard-filters customer support rows by Run AUD and intelligence", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/benchmarks?useCase=customer-support&includeItsBenchmark=false&maxRunCostAud=1300&minIntelligence=30",
      ),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.benchmarks.length).toBeGreaterThan(0);
    expect(
      body.benchmarks.every(
        (row: {
          benchmarks: {
            llm?: {
              intelligence?: number;
              intelligenceRunTotalCost?: number;
            };
          };
        }) =>
          (row.benchmarks.llm?.intelligence ?? Number.NEGATIVE_INFINITY) >= 30 &&
          (row.benchmarks.llm?.intelligenceRunTotalCost ??
            Number.POSITIVE_INFINITY) <= 1300,
      ),
    ).toBe(true);
    expect(
      body.benchmarks.some(
        (row: { benchmarks: { llm?: { tauTelecom?: number } } }) =>
          typeof row.benchmarks.llm?.tauTelecom === "number",
      ),
    ).toBe(true);
  });

  it("applies Run AUD and intelligence filters to recommendations", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?provider=xai&useCase=customer-support&tier=fast&includeItsBenchmark=false&maxRunCostAud=1300&minIntelligence=30",
      ),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.recommendation).toMatchObject({
      provider: "xai",
      benchmarks: {
        llm: expect.objectContaining({
          intelligence: expect.any(Number),
          intelligenceRunTotalCost: expect.any(Number),
        }),
      },
    });
    expect(body.recommendation.benchmarks.llm.intelligence).toBeGreaterThanOrEqual(
      30,
    );
    expect(
      body.recommendation.benchmarks.llm.intelligenceRunTotalCost,
    ).toBeLessThanOrEqual(1300);
  });

  it("supports USD run-cost caps and preview opt-in for customer-support recommendations", async () => {
    const defaultResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?provider=google&useCase=customer-support&tier=best&includeItsBenchmark=false&maxRunCostUsd=900",
      ),
      env(),
      ctx,
    );

    const defaultBody = (await defaultResponse.json()) as JsonObject;

    expect(defaultResponse.status).toBe(200);
    expect(defaultBody.recommendation).toMatchObject({
      provider: "google",
      availability: expect.objectContaining({
        status: "production",
      }),
    });

    const previewResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?provider=google&useCase=customer-support&tier=best&includeItsBenchmark=false&allowPreview=true&maxRunCostUsd=900",
      ),
      env(),
      ctx,
    );
    const previewBody = (await previewResponse.json()) as JsonObject;

    expect(previewResponse.status).toBe(200);
    expect(previewBody.recommendation).toMatchObject({
      id: "gemini-3-1-pro-preview",
      provider: "google",
      availability: expect.objectContaining({
        status: "preview",
      }),
    });
    expect(
      previewBody.recommendation.benchmarks.llm.intelligenceRunTotalCost,
    ).toBeLessThanOrEqual(1350);

    const cappedRowsResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/benchmarks?useCase=customer-support&includeItsBenchmark=false&allowPreview=true&maxRunCostUsd=900",
      ),
      env(),
      ctx,
    );
    const cappedRowsBody = (await cappedRowsResponse.json()) as JsonObject;
    const ids = cappedRowsBody.benchmarks.map((row: { id: string }) => row.id);

    expect(cappedRowsResponse.status).toBe(200);
    expect(ids).toContain("gemini-3-1-pro-preview");
    expect(ids).toContain("grok-4-3");
    expect(ids).not.toContain("gemini-3-5-flash");

    const xaiResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?provider=xai&useCase=customer-support&tier=fast&includeItsBenchmark=false&maxRunCostUsd=900",
      ),
      env(),
      ctx,
    );
    const xaiBody = (await xaiResponse.json()) as JsonObject;

    expect(xaiResponse.status).toBe(200);
    expect(xaiBody.recommendation).toMatchObject({
      provider: "xai",
    });
    expect(
      xaiBody.recommendation.benchmarks.llm.intelligenceRunTotalCost,
    ).toBeLessThanOrEqual(1350);
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
      id: "gpt-5-5-low",
      provider: "openai",
      pricing: expect.objectContaining({
        inputPerMTok: 7.5,
        outputPerMTok: 45,
      }),
      benchmarks: {
        llm: expect.objectContaining({
          customerSupportRank: 10,
          autoClose: expect.objectContaining({
            falsePositiveCount: 8,
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
      id: "gpt-5-5-low",
      provider: "openai",
      benchmarks: {
        llm: expect.objectContaining({
          customerSupportRank: 10,
          autoClose: expect.objectContaining({
            falsePositiveCount: 8,
          }),
        }),
      },
    });

    const fastResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?provider=openai&useCase=customer-support&tier=fast",
      ),
      env(),
      ctx,
    );
    const fastBody = (await fastResponse.json()) as JsonObject;

    expect(fastResponse.status).toBe(200);
    expect(fastBody.recommendation).toMatchObject({
      provider: "openai",
      benchmarks: {
        llm: expect.objectContaining({
          intelligenceRunTotalCost: expect.any(Number),
        }),
      },
    });
    expect(
      fastBody.recommendation.benchmarks.llm.intelligenceRunTotalCost,
    ).toBeLessThanOrEqual(
      body.recommendation.benchmarks.llm.intelligenceRunTotalCost,
    );
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
    expect(body.benchmarks.map((row: { id: string }) => row.id)).not.toContain(
      "google-gemini-2-0-flash-lite",
    );
    expect(body.benchmarks.map((row: { id: string }) => row.id)).not.toContain(
      "google-gemini-2-0-flash",
    );
  });

  it("hard-filters speech-to-text rows by AA-WER", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/benchmarks?useCase=speech-to-text&maxAaWer=3",
      ),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(
      body.benchmarks.every(
        (row: { benchmarks: { speechToText?: { aaWer?: number } } }) =>
          (row.benchmarks.speechToText?.aaWer ?? Number.POSITIVE_INFINITY) <= 3,
      ),
    ).toBe(true);
    expect(body.benchmarks.map((row: { id: string }) => row.id)).not.toContain(
      "groq-whisper-large-v3-turbo",
    );
  });

  it("keeps Groq Whisper and excludes deprecated Gemini STT rows under default ceilings", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/benchmarks?useCase=speech-to-text&maxAaWer=4.6&maxTranscriptionCostPer1kMinutes=10",
      ),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;
    const ids = body.benchmarks.map((row: { id: string }) => row.id);

    expect(response.status).toBe(200);
    expect(ids).toContain("groq-whisper-large-v3-turbo");
    expect(ids).not.toContain("google-gemini-2-0-flash-lite");
    expect(ids).not.toContain("google-gemini-2-0-flash");
    expect(
      body.benchmarks.every(
        (row: { benchmarks: { speechToText?: { aaWer?: number } } }) =>
          (row.benchmarks.speechToText?.aaWer ?? Number.POSITIVE_INFINITY) <= 4.6,
      ),
    ).toBe(true);
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
    expect(body.models.map((row: { id: string }) => row.id)).not.toContain(
      "google-gemini-2-0-flash-lite",
    );
    expect(body.models.map((row: { id: string }) => row.id)).not.toContain(
      "google-gemini-2-0-flash",
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

    const defaultCappedResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=speech-to-text&maxAaWer=4.6&maxTranscriptionCostPer1kMinutes=10",
      ),
      env(),
      ctx,
    );
    const defaultCappedBody = (await defaultCappedResponse.json()) as JsonObject;
    const cappedGroqVisibleResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=speech-to-text&provider=groq&maxAaWer=4.6&maxTranscriptionCostPer1kMinutes=10",
      ),
      env(),
      ctx,
    );
    const cappedGroqVisibleBody =
      (await cappedGroqVisibleResponse.json()) as JsonObject;
    const fastCheapResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=speech-to-text&tier=fast&maxAaWer=4.6&maxTranscriptionCostPer1kMinutes=10",
      ),
      env(),
      ctx,
    );
    const fastCheapBody = (await fastCheapResponse.json()) as JsonObject;

    expect(defaultCappedResponse.status).toBe(200);
    expect(defaultCappedBody.recommendation.deprecated).not.toBe(true);
    expect(defaultCappedBody.recommendation.id).not.toBe(
      "google-gemini-2-0-flash-lite",
    );
    expect(cappedGroqVisibleResponse.status).toBe(200);
    expect(cappedGroqVisibleBody.recommendation).toMatchObject({
      id: "groq-whisper-large-v3-turbo",
      provider: "groq",
    });
    expect(fastCheapResponse.status).toBe(200);
    expect(fastCheapBody.recommendation).toMatchObject({
      id: "groq-whisper-large-v3-turbo",
      provider: "groq",
    });

    const cappedGroqResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=speech-to-text&provider=groq&maxAaWer=3",
      ),
      env(),
      ctx,
    );
    const cappedGroqBody = (await cappedGroqResponse.json()) as JsonObject;

    expect(cappedGroqResponse.status).toBe(404);
    expect(cappedGroqBody.error).toBe("not_found");
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
