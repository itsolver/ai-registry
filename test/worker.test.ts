import { describe, expect, it } from "vitest";
import { handleRequest, type Env } from "../src/worker";
import type { BenchmarkCandidate, Catalog } from "../src/registry";
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
    JSON.stringify({
      amount: 1,
      base: "USD",
      date: "2026-05-19",
      rates: { AUD: 1.5 },
    }),
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

function envWithCachedCatalog(catalog: Catalog): Env {
  return {
    MODEL_CACHE: {
      get: async () => JSON.stringify(catalog),
      put: async () => undefined,
    } as unknown as KVNamespace,
  };
}

function supportCandidate(
  id: string,
  falsePositiveCount: number,
  accuracy: number,
  runCost: number,
  outputPerMTok: number,
): BenchmarkCandidate {
  return {
    id,
    provider: "openai",
    name: id,
    source: "artificialanalysis",
  benchmarks: {
    llm: {
      instructionFollowing: 80,
      intelligence: 80,
      intelligenceRunTotalCost: runCost,
      intelligenceCostPerTask: runCost / 1000,
      autoClose: {
          source: "itsolver-autoclose",
          modelKey: `test:${id}`,
          apiModel: id,
          displayName: id,
          benchmarkReport: `${id}.md`,
          resultsFile: `${id}.json`,
          generatedAt: "2026-05-22T00:00:00Z",
          benchmarkCodeSha: "test",
          total: 100,
          correctCount: Math.round(accuracy * 100),
          accuracy,
          falsePositiveCount,
          falseNegativeCount: 100 - Math.round(accuracy * 100),
          invalidCount: 0,
          errorCount: 0,
          parseSuccessRate: 1,
          avgLatencyMs: 1000,
          p95LatencyMs: 1200,
          avgInputTokens: 1000,
          avgOutputTokens: 100,
          weightedScore: accuracy * 100,
          sourceUrl: "https://example.test/autoclose",
          verifiedOn: "2026-05-22",
          availability: {
            status: "production",
            acceptedRisk: false,
            reason: "test",
          },
        },
      },
    },
    pricing: { inputPerMTok: 1, outputPerMTok },
    recommendable: true,
    availability: {
      status: "production",
      acceptedRisk: false,
      reason: "test",
    },
    family: null,
    contextWindow: null,
    outputLimit: null,
    capabilities: {
      vision: false,
      pdf: false,
      reasoning: true,
      toolCalling: false,
      structuredOutput: false,
    },
    modalities: null,
    openWeights: null,
    tier: null,
    deprecated: null,
    updatedAt: null,
  };
}

function supportCatalog(candidates: BenchmarkCandidate[]): Catalog {
  return {
    generatedAt: new Date().toISOString(),
    modelCount: candidates.length,
    activeModelCount: candidates.length,
    providers: [
      {
        provider: "openai",
        total: candidates.length,
        active: candidates.length,
      },
    ],
    models: [],
    benchmarkCandidates: candidates,
  };
}

describe("worker routes", () => {
  it("serves the homepage without auth", async () => {
    const response = await handleRequest(
      new Request("https://ai.itsolver.au/"),
      env(),
      ctx,
    );

    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain('ai<span class="blink">.</span>itsolver');
    expect(html).toContain("Bench Telecom");
    expect(html).toContain("highest quality");
    expect(html).toContain(
      '<option value="fast" selected>fast and cheap</option>',
    );
    expect(html).toContain(
      '<div class="b-field" data-filter-scope="text">\n          <label for="b-capability">Must have</label>',
    );
    expect(html).toContain("model.capabilities[capability] !== true");
    expect(html).toContain("function textBenchmarkPath()");
    expect(html).toContain(
      "fetch(textBenchmarkPath(), { cache: 'no-store' })",
    );
    expect(html).toContain('<option value="benchmarks">browse benchmark rows</option>');
    expect(html).toContain('<option value="document-processing">document processing (OCR)</option>');
  });

  it("serves the ITS auto-close benchmark page without catalog access", async () => {
    for (const path of ["/its-eval", "/its-eval/"]) {
      const response = await handleRequest(
        new Request(`https://ai.itsolver.au${path}`),
        {},
        ctx,
      );

      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain("ITS Auto-Close Benchmark");
      expect(html).toContain("gemini:gemini-3-flash-preview");
      expect(html).toContain("No Gemini candidate");
      expect(html).toContain("Invalids are contract failures.");
      expect(html).toContain('data-sort="accuracy"');
      expect(html).toContain("Show deprecated rows");
      expect(html).toContain(
        '<tr data-deprecated="true" hidden>\n            <td data-value-model="gemini 3.1 flash-lite preview">',
      );
    }

    const redirect = await handleRequest(
      new Request("https://ai.itsolver.au/its"),
      {},
      ctx,
    );
    expect(redirect.status).toBe(301);
    expect(redirect.headers.get("location")).toBe(
      "https://ai.itsolver.au/its-eval",
    );
  });

  it("keeps public ITS benchmark rows aggregate-only", async () => {
    const response = await handleRequest(
      new Request("https://ai.itsolver.au/its-eval"),
      {},
      ctx,
    );
    const html = await response.text();

    expect(html).not.toContain("29727");
    expect(html).not.toContain("Perfect, understood");
    expect(html).not.toContain("KeyboardInterrupt");
    expect(html).not.toContain("raw_output");
  });

  it("serves the web development benchmark composite without catalog access", async () => {
    for (const path of ["/webdev", "/webdev/"]) {
      const response = await handleRequest(
        new Request(`https://ai.itsolver.au${path}`),
        {},
        ctx,
      );

      expect(response.status).toBe(200);
      const html = await response.text();
      expect(html).toContain("Web App Development Model Winners");
      expect(html).toContain("Current public winner");
      expect(html).toContain("GPT-5.5: 69.85%");
      expect(html).toContain("Claude Fable 5: 90.35%");
      expect(html).toContain("Gemini 3.5 Flash: 78.80%");
      expect(html).toContain("Grok CLI Grok 4.20 Reasoning: 57.3%");
      expect(html).toContain('<span class="tab active">Performance</span>');
      expect(html).toContain("Cost / time signal");
      expect(html).toContain("https://www.vals.ai/benchmarks/vibe-code");
      expect(html).toContain(
        "headline winners first, then benchmark breakdown, cost, and runtime context",
      );
    }
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

  it("serves benchmark rows without registry joins", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/benchmarks?useCase=customer-support",
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
    expect(body.benchmarks.map((row: { id: string }) => row.id)).not.toContain(
      "gemini-2.0-flash-lite",
    );
    expect(
      body.benchmarks.some(
        (row: { id: string; recommendable: boolean }) =>
          row.id === "gemini-2-5-flash-lite" && row.recommendable === false,
      ),
    ).toBe(true);
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
        (row: {
          benchmarks: { llm?: { intelligenceRunTotalCost?: number } };
        }) =>
          (row.benchmarks.llm?.intelligenceRunTotalCost ??
            Number.NEGATIVE_INFINITY) >= 100 &&
          (row.benchmarks.llm?.intelligenceRunTotalCost ??
            Number.POSITIVE_INFINITY) <= 1500,
      ),
    ).toBe(true);
  });

  it("does not recommend non-result AA rows in customer support AA-only mode", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=customer-support&includeItsBenchmark=false",
      ),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.recommendation.id).not.toBe("gpt-oss-20b-low");
    expect(body.recommendation.capabilities).toMatchObject({
      vision: true,
      reasoning: true,
    });
  });

  it("returns an AA support candidate for balanced AA-only customer-support requests", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=customer-support&tier=balanced&includeItsBenchmark=false&maxInputCostPerMTok=35.45&maxRunCostAud=1300&minIntelligence=30",
      ),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.recommendation).toMatchObject({
      capabilities: expect.objectContaining({
        vision: true,
        reasoning: true,
      }),
      benchmarks: {
        llm: expect.objectContaining({
          customerSupportRank: expect.any(Number),
          intelligenceRunTotalCost: expect.any(Number),
        }),
      },
    });
  });

  it("keeps the catalog available when the optional STT API fetch fails", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=customer-support",
      ),
      {
        ...env(),
        ARTIFICIAL_ANALYSIS_STT_URL: "http://%",
      },
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.recommendation).toMatchObject({
      recommendable: true,
    });
  });

  it("hard-filters customer support rows by Intelligence Index Task AUD", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/benchmarks?useCase=customer-support&includeItsBenchmark=false&maxIntelligenceCostPerTaskAud=1",
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
          benchmarks: { llm?: { intelligenceCostPerTask?: number } };
        }) =>
          (row.benchmarks.llm?.intelligenceCostPerTask ??
            Number.POSITIVE_INFINITY) <= 1,
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
          (row.benchmarks.llm?.intelligence ?? Number.NEGATIVE_INFINITY) >=
            30 &&
          (row.benchmarks.llm?.intelligenceRunTotalCost ??
            Number.POSITIVE_INFINITY) <= 1300,
      ),
    ).toBe(true);
  });

  it("populates ITS auto-close columns in customer-support model rows", async () => {
    const cappedResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models?tier=best&useCase=customer-support&maxRunCostAud=1300&minIntelligence=30",
      ),
      env(),
      ctx,
    );
    const cappedBody = (await cappedResponse.json()) as JsonObject;

    expect(cappedResponse.status).toBe(200);
    const autoCloseRows = cappedBody.models.filter(
      (row: { benchmarks: { llm?: { autoClose?: unknown } } }) =>
        row.benchmarks.llm?.autoClose,
    );
    expect(autoCloseRows.length).toBeGreaterThan(0);
    expect(autoCloseRows.map((row: { id: string }) => row.id)).toEqual(
      expect.arrayContaining(["gpt-5-5-low", "grok-4-3"]),
    );
    expect(autoCloseRows[0].benchmarks.llm.autoClose).toMatchObject({
      falsePositiveCount: expect.any(Number),
      accuracy: expect.any(Number),
      benchmarkReport: expect.any(String),
    });
  });

  it("hard-filters customer support rows by capability", async () => {
    const reasoningResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/benchmarks?useCase=customer-support&capability=reasoning&includeItsBenchmark=false&maxRunCostAud=1300&minIntelligence=30",
      ),
      env(),
      ctx,
    );
    const reasoningBody = (await reasoningResponse.json()) as JsonObject;
    const pdfResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/benchmarks?useCase=customer-support&capability=pdf&includeItsBenchmark=false&maxRunCostAud=1300&minIntelligence=30",
      ),
      env(),
      ctx,
    );
    const pdfBody = (await pdfResponse.json()) as JsonObject;
    const recommendationResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=customer-support&capability=pdf&includeItsBenchmark=false&maxRunCostAud=1300&minIntelligence=30",
      ),
      env(),
      ctx,
    );

    expect(reasoningResponse.status).toBe(200);
    expect(reasoningBody.benchmarks.length).toBeGreaterThan(0);
    expect(
      reasoningBody.benchmarks.every(
        (row: { capabilities?: { reasoning?: boolean } }) =>
          row.capabilities?.reasoning === true,
      ),
    ).toBe(true);
    expect(pdfResponse.status).toBe(200);
    expect(pdfBody.benchmarks).toEqual([]);
    expect(recommendationResponse.status).toBe(404);
  });

  it("returns document-processing benchmark rows with provider, cost, and intelligence filters", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/benchmarks?useCase=document-processing&provider=google&maxIntelligenceCostPerTaskAud=1&minIntelligence=30",
      ),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.benchmarkCount).toBeGreaterThan(0);
    expect(
      body.benchmarks.every(
        (row: {
          provider: string;
          benchmarks: {
            llm?: {
              visualReasoning?: number;
              intelligence?: number;
              intelligenceCostPerTask?: number;
            };
          };
        }) =>
          row.provider === "google" &&
          typeof row.benchmarks.llm?.visualReasoning === "number" &&
          (row.benchmarks.llm.intelligence ?? Number.NEGATIVE_INFINITY) >=
            30 &&
          (row.benchmarks.llm.intelligenceCostPerTask ??
            Number.POSITIVE_INFINITY) <= 1,
      ),
    ).toBe(true);
  });

  it("uses highest visual reasoning for document-processing best recommendations", async () => {
    const query =
      "useCase=document-processing&provider=google&maxIntelligenceCostPerTaskAud=5&minIntelligence=30";
    const rowsResponse = await handleRequest(
      new Request(`https://ai.itsolver.au/v1/benchmarks?${query}`),
      env(),
      ctx,
    );
    const rowsBody = (await rowsResponse.json()) as JsonObject;
    const recommendationResponse = await handleRequest(
      new Request(
        `https://ai.itsolver.au/v1/models/recommend?${query}&tier=best`,
      ),
      env(),
      ctx,
    );
    const recommendationBody =
      (await recommendationResponse.json()) as JsonObject;
    const normalized = (value: number | undefined) =>
      typeof value === "number" ? (value <= 1 ? value * 100 : value) : -Infinity;
    const eligible = rowsBody.benchmarks
      .filter((row: JsonObject) => row.recommendable)
      .sort(
        (left: JsonObject, right: JsonObject) =>
          normalized(right.benchmarks.llm.visualReasoning) -
            normalized(left.benchmarks.llm.visualReasoning) ||
          normalized(right.benchmarks.llm.instructionFollowing) -
            normalized(left.benchmarks.llm.instructionFollowing) ||
          (right.benchmarks.llm.intelligence ?? -Infinity) -
            (left.benchmarks.llm.intelligence ?? -Infinity),
      );

    expect(rowsResponse.status).toBe(200);
    expect(recommendationResponse.status).toBe(200);
    expect(eligible.length).toBeGreaterThan(0);
    expect(recommendationBody.recommendation.id).toBe(eligible[0].id);
    expect(
      rowsBody.benchmarks.some((row: JsonObject) => row.recommendable === false),
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
    expect(
      body.recommendation.benchmarks.llm.intelligence,
    ).toBeGreaterThanOrEqual(30);
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
      id: "gemini-2-5-pro",
      provider: "google",
      availability: expect.objectContaining({
        status: "production",
      }),
    });

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
      provider: "openai",
      pricing: expect.objectContaining({
        inputPerMTok: expect.any(Number),
        outputPerMTok: expect.any(Number),
      }),
      benchmarks: {
        llm: expect.objectContaining({
          intelligenceCostPerTask: expect.any(Number),
          autoClose: expect.objectContaining({
            falsePositiveCount: expect.any(Number),
            verifiedOn: expect.any(String),
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
    const falsePositiveRate = (row: JsonObject) => {
      const autoClose = row.benchmarks.llm.autoClose;
      return autoClose.total > 0
        ? autoClose.falsePositiveCount / autoClose.total
        : Number.POSITIVE_INFINITY;
    };
    expect(bestBody.recommendation).toMatchObject({
      provider: "openai",
      benchmarks: {
        llm: expect.objectContaining({
          autoClose: expect.objectContaining({
            falsePositiveCount: expect.any(Number),
          }),
        }),
      },
    });
    expect(falsePositiveRate(bestBody.recommendation)).toBeLessThanOrEqual(
      falsePositiveRate(body.recommendation),
    );

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
          intelligenceCostPerTask: expect.any(Number),
          intelligenceRunTotalCost: expect.any(Number),
        }),
      },
    });
    expect(
      fastBody.recommendation.benchmarks.llm.intelligenceCostPerTask,
    ).toBeLessThanOrEqual(
      body.recommendation.benchmarks.llm.intelligenceCostPerTask,
    );
    expect(body.recommendation.id).toBe(fastBody.recommendation.id);
  });

  it("returns the next two safest customer-support failovers for best tier", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=customer-support&tier=best&capability=reasoning",
      ),
      envWithCachedCatalog(
        supportCatalog([
          supportCandidate("safest", 0, 0.91, 500, 20),
          supportCandidate("safe", 1, 0.92, 400, 20),
          supportCandidate("middle", 2, 0.93, 300, 20),
          supportCandidate("risky", 3, 0.99, 200, 20),
        ]),
      ),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.recommendation.id).toBe("safest");
    expect(body.failovers.map((model: { id: string }) => model.id)).toEqual([
      "safe",
      "middle",
    ]);
    expect(body.failoverStatus).toEqual({
      requested: 2,
      returned: 2,
    });
  });

  it("returns the next two cheapest customer-support failovers for fast tier", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=customer-support&tier=fast&capability=reasoning",
      ),
      envWithCachedCatalog(
        supportCatalog([
          supportCandidate("safest-expensive", 0, 0.91, 900, 20),
          supportCandidate("cheapest", 4, 0.99, 50, 1),
          supportCandidate("next-cheapest", 3, 0.99, 100, 1),
          supportCandidate("third-cheapest", 2, 0.99, 200, 1),
        ]),
      ),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.recommendation.id).toBe("cheapest");
    expect(body.failovers.map((model: { id: string }) => model.id)).toEqual([
      "next-cheapest",
      "third-cheapest",
    ]);
    expect(body.failoverStatus).toEqual({
      requested: 2,
      returned: 2,
    });
  });

  it("reports thin customer-support failover coverage", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=customer-support&tier=best&capability=reasoning",
      ),
      envWithCachedCatalog(
        supportCatalog([
          supportCandidate("only-benchmarked", 0, 0.91, 500, 20),
        ]),
      ),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.recommendation.id).toBe("only-benchmarked");
    expect(body.failovers).toEqual([]);
    expect(body.failoverStatus).toEqual({
      requested: 2,
      returned: 0,
      reason: "insufficient_its_autoclose_benchmarks",
    });
  });

  it("uses voice priority tiers for quality, cost, and balance", async () => {
    const defaultResponse = await handleRequest(
      new Request("https://ai.itsolver.au/v1/models/recommend?useCase=voice"),
      env(),
      ctx,
    );
    const defaultBody = (await defaultResponse.json()) as JsonObject;
    const fastResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=voice&tier=fast",
      ),
      env(),
      ctx,
    );
    const fastBody = (await fastResponse.json()) as JsonObject;
    const bestResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=voice&tier=best",
      ),
      env(),
      ctx,
    );
    const bestBody = (await bestResponse.json()) as JsonObject;

    expect(defaultResponse.status).toBe(200);
    expect(fastResponse.status).toBe(200);
    expect(bestResponse.status).toBe(200);
    expect(defaultBody.recommendation).toMatchObject({
      benchmarks: { voice: expect.any(Object) },
      pricing: expect.objectContaining({
        benchmarkInputAudioPerHour: expect.any(Number),
      }),
    });
    expect(defaultBody.recommendation.id).toBe(fastBody.recommendation.id);
    expect(fastBody.recommendation).toMatchObject({
      benchmarks: { voice: expect.any(Object) },
      pricing: expect.objectContaining({
        benchmarkInputAudioPerHour: expect.any(Number),
      }),
    });
    expect(bestBody.recommendation).toMatchObject({
      benchmarks: { voice: expect.any(Object) },
      pricing: expect.objectContaining({
        benchmarkInputAudioPerHour: expect.any(Number),
      }),
    });
    expect(
      fastBody.recommendation.pricing.benchmarkInputAudioPerHour,
    ).toBeLessThanOrEqual(
      bestBody.recommendation.pricing.benchmarkInputAudioPerHour,
    );
    const voiceQuality = (voice: {
      agenticPerformance?: number;
      speechReasoning?: number;
      telecomAgenticPerformance?: number;
      conversationalDynamics?: number;
    }) =>
      (voice.agenticPerformance ?? 0) * 0.45 +
      (voice.speechReasoning ?? 0) * 0.35 +
      (voice.telecomAgenticPerformance ?? 0) * 0.15 +
      (voice.conversationalDynamics ?? 0) * 0.05;
    expect(
      voiceQuality(bestBody.recommendation.benchmarks.voice),
    ).toBeGreaterThanOrEqual(
      voiceQuality(fastBody.recommendation.benchmarks.voice),
    );
  });

  it("hard-filters voice rows by input audio cost", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/benchmarks?useCase=voice&maxAudioInputCostPerHour=3",
      ),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.benchmarks.length).toBeGreaterThan(0);
    expect(
      body.benchmarks.every(
        (row: { pricing: { benchmarkInputAudioPerHour?: number } }) =>
          (row.pricing.benchmarkInputAudioPerHour ??
            Number.POSITIVE_INFINITY) <= 3,
      ),
    ).toBe(true);
  });

  it("serves speech-to-text benchmark rows", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/benchmarks?useCase=speech-to-text",
      ),
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
          (row.benchmarks.speechToText?.aaWer ?? Number.POSITIVE_INFINITY) <=
          4.6,
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
    const defaultCappedBody =
      (await defaultCappedResponse.json()) as JsonObject;
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
    expect(
      body.providers.map((provider: { provider: string }) => provider.provider),
    ).toEqual([
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
