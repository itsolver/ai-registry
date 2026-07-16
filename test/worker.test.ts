import { describe, expect, it, vi } from "vitest";
import { handleRequest, type Env } from "../src/worker";
import type { BenchmarkCandidate, Catalog } from "../src/registry";
import {
  artificialAnalysisFreeFixture,
  artificialAnalysisFixture,
  artificialAnalysisSpeechToTextFixture,
  modelsDevFixture,
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
const artificialAnalysisFreeUrl =
  "data:application/json," +
  encodeURIComponent(JSON.stringify(artificialAnalysisFreeFixture));
const modelsDevUrl =
  "data:application/json," +
  encodeURIComponent(JSON.stringify(modelsDevFixture));

function env(): Env {
  return {
    FX_RATE_URL: fxUrl,
    MODELS_DEV_URL: modelsDevUrl,
    ARTIFICIAL_ANALYSIS_API_KEY: "aa-secret",
    ARTIFICIAL_ANALYSIS_LLM_URL: artificialAnalysisUrl,
    ARTIFICIAL_ANALYSIS_FREE_LLM_URL: artificialAnalysisFreeUrl,
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
      '<div class="b-field" data-filter-scope="customer-support">\n          <label for="b-capability">Must have</label>',
    );
    expect(html).toContain("Min visual reasoning");
    expect(html).toContain("Max image AUD/1k");
    expect(html).not.toContain('data-filter-scope="text"');
    expect(html).toContain("model.capabilities[capability] !== true");
    expect(html).toContain("function textBenchmarkPath()");
    expect(html).toContain(
      "fetch(textBenchmarkPath(), { cache: 'no-store' })",
    );
    expect(html).toContain('<option value="benchmarks">browse benchmark rows</option>');
    expect(html).toContain('<option value="document-processing">document processing (OCR)</option>');
    expect(html).toContain('<option value="voice">speech to speech (voice)</option>');
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
      providerCount: 6,
    });
    expect(body.modelCount).toBe(7);
    expect(body.activeModelCount).toBe(7);
    expect(body.registryModelCount).toBe(7);
    expect(body.benchmarkCount).toBeGreaterThan(body.registryModelCount);
    expect(body.recommendableCount).toBeGreaterThan(0);
  });

  it("loads every page from the current Artificial Analysis free endpoint", async () => {
    const realFetch = globalThis.fetch;
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (!url.startsWith("https://aa.test/language/models/free")) {
          return realFetch(input, init);
        }
        const page = Number(new URL(url).searchParams.get("page") ?? "1");
        const rows = artificialAnalysisFreeFixture.data;
        return Response.json({
          tier: "free",
          pagination: {
            page,
            page_size: 2,
            total_pages: 2,
            has_more: page === 1,
          },
          data: page === 1 ? rows.slice(0, 1) : rows.slice(1),
        });
      },
    );

    try {
      const response = await handleRequest(
        new Request("https://ai.itsolver.au/v1/benchmarks"),
        {
          ...env(),
          ARTIFICIAL_ANALYSIS_FREE_LLM_URL:
            "https://aa.test/language/models/free",
        },
        ctx,
      );
      const body = (await response.json()) as JsonObject;
      expect(response.status).toBe(200);
      expect(body.benchmarks.map((row: { id: string }) => row.id)).toEqual(
        expect.arrayContaining([
          "claude-fable-5-high",
          "gpt-5-6-sol-high",
          "grok-4-5",
        ]),
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://aa.test/language/models/free?page=2",
        expect.any(Object),
      );
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("serves a stale valid cache without overwriting it when models.dev fails", async () => {
    let putCount = 0;
    const cached = supportCatalog([supportCandidate("cached", 0, 0.9, 10, 2)]);
    cached.generatedAt = "2020-01-01T00:00:00Z";
    const response = await handleRequest(
      new Request("https://ai.itsolver.au/v1/health"),
      {
        MODEL_CACHE: {
          get: async () => JSON.stringify(cached),
          put: async () => {
            putCount += 1;
          },
        } as unknown as KVNamespace,
        MODELS_DEV_URL: "data:application/json,%5B%5D",
      },
      ctx,
    );

    expect(response.status).toBe(200);
    expect((await response.json()) as JsonObject).toMatchObject({
      benchmarkCount: 1,
      registryModelCount: 0,
    });
    expect(putCount).toBe(0);
  });

  it("rejects empty and structurally partial models.dev responses", async () => {
    for (const source of [
      {},
      { openai: modelsDevFixture.openai },
      {
        ...modelsDevFixture,
        anthropic: { models: {} },
      },
      {
        ...modelsDevFixture,
        anthropic: { models: { broken: {} } },
      },
      { ...modelsDevFixture, nvidia: undefined },
      { ...modelsDevFixture, groq: undefined },
    ]) {
      let putCount = 0;
      const cached = supportCatalog([
        supportCandidate("cached", 0, 0.9, 10, 2),
      ]);
      cached.generatedAt = "2020-01-01T00:00:00Z";
      const response = await handleRequest(
        new Request("https://ai.itsolver.au/v1/health"),
        {
          ...env(),
          MODEL_CACHE: {
            get: async () => JSON.stringify(cached),
            put: async () => {
              putCount += 1;
            },
          } as unknown as KVNamespace,
          MODELS_DEV_URL:
            "data:application/json," +
            encodeURIComponent(JSON.stringify(source)),
        },
        ctx,
      );

      expect(response.status).toBe(200);
      expect((await response.json()) as JsonObject).toMatchObject({
        benchmarkCount: 1,
        registryModelCount: 0,
      });
      expect(putCount).toBe(0);
    }
  });

  it("does not drop an optional registry provider that exists in the cache", async () => {
    let putCount = 0;
    const cached = supportCatalog([]);
    cached.generatedAt = "2020-01-01T00:00:00Z";
    cached.modelCount = 1;
    cached.activeModelCount = 1;
    cached.providers = [
      { provider: "elevenlabs", total: 1, active: 1 },
    ];
    cached.models = [
      {
        id: "elevenlabs-future-model",
        provider: "elevenlabs",
        name: "ElevenLabs Future Model",
        family: "elevenlabs",
        contextWindow: 8_000,
        outputLimit: 1_000,
        pricing: { inputPerMTok: 1, outputPerMTok: 2 },
        capabilities: {
          vision: false,
          pdf: false,
          reasoning: false,
          toolCalling: false,
          structuredOutput: false,
        },
        modalities: { input: ["text"], output: ["text"] },
        openWeights: false,
        tier: "fast",
        deprecated: false,
        updatedAt: "2026-07-16T00:00:00Z",
        availability: {
          status: "production",
          acceptedRisk: false,
          reason: "test",
        },
      },
    ];

    const response = await handleRequest(
      new Request("https://ai.itsolver.au/v1/health"),
      {
        ...env(),
        MODEL_CACHE: {
          get: async () => JSON.stringify(cached),
          put: async () => {
            putCount += 1;
          },
        } as unknown as KVNamespace,
      },
      ctx,
    );

    expect(response.status).toBe(200);
    expect((await response.json()) as JsonObject).toMatchObject({
      providerCount: 1,
      registryModelCount: 1,
    });
    expect(putCount).toBe(0);
  });

  it("rejects an empty current-free AA aggregate without overwriting cache", async () => {
    let putCount = 0;
    const cached = supportCatalog([supportCandidate("cached", 0, 0.9, 10, 2)]);
    cached.generatedAt = "2020-01-01T00:00:00Z";
    const emptyAaUrl =
      "data:application/json," +
      encodeURIComponent(
        JSON.stringify({
          tier: "free",
          pagination: {
            page: 1,
            page_size: 200,
            total_pages: 1,
            has_more: false,
          },
          data: [],
        }),
      );
    const response = await handleRequest(
      new Request("https://ai.itsolver.au/v1/health"),
      {
        ...env(),
        MODEL_CACHE: {
          get: async () => JSON.stringify(cached),
          put: async () => {
            putCount += 1;
          },
        } as unknown as KVNamespace,
        ARTIFICIAL_ANALYSIS_FREE_LLM_URL: emptyAaUrl,
      },
      ctx,
    );

    expect(response.status).toBe(200);
    expect((await response.json()) as JsonObject).toMatchObject({
      benchmarkCount: 1,
      registryModelCount: 0,
    });
    expect(putCount).toBe(0);
  });

  it("rejects malformed current-free pagination and model identities", async () => {
    const validRow = artificialAnalysisFreeFixture.data[0];
    const invalidBodies = [
      { tier: "free", data: [validRow] },
      {
        tier: "free",
        pagination: { page: 1, total_pages: 1, has_more: false },
        data: [{ id: "broken", name: "Broken", slug: "" }],
      },
      {
        tier: "free",
        pagination: { page: 2, total_pages: 2, has_more: false },
        data: [validRow],
      },
      {
        tier: "free",
        pagination: { page: 1, total_pages: 2, has_more: false },
        data: [validRow],
      },
    ];

    for (const body of invalidBodies) {
      let putCount = 0;
      const cached = supportCatalog([
        supportCandidate("cached", 0, 0.9, 10, 2),
      ]);
      cached.generatedAt = "2020-01-01T00:00:00Z";
      const response = await handleRequest(
        new Request("https://ai.itsolver.au/v1/health"),
        {
          ...env(),
          MODEL_CACHE: {
            get: async () => JSON.stringify(cached),
            put: async () => {
              putCount += 1;
            },
          } as unknown as KVNamespace,
          ARTIFICIAL_ANALYSIS_FREE_LLM_URL:
            "data:application/json," +
            encodeURIComponent(JSON.stringify(body)),
        },
        ctx,
      );

      expect(response.status).toBe(200);
      expect((await response.json()) as JsonObject).toMatchObject({
        benchmarkCount: 1,
        registryModelCount: 0,
      });
      expect(putCount).toBe(0);
    }
  });

  it("uses the restored registry for recommendations without a use case", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?provider=openai",
      ),
      env(),
      ctx,
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as JsonObject;
    expect(body.recommendation).toMatchObject({
      provider: "openai",
      id: expect.stringMatching(/^gpt-5\.6/),
    });
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
          agentic: expect.any(Number),
          instructionFollowing: expect.any(Number),
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

  it("populates ITS auto-close columns in customer-support benchmark rows", async () => {
    const cappedResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/benchmarks?tier=best&useCase=customer-support&maxRunCostAud=1300&minIntelligence=30",
      ),
      env(),
      ctx,
    );
    const cappedBody = (await cappedResponse.json()) as JsonObject;

    expect(cappedResponse.status).toBe(200);
    const autoCloseRows = cappedBody.benchmarks.filter(
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
    expect(pdfBody.benchmarks).toContainEqual(
      expect.objectContaining({
        id: "claude-fable-5-high",
        capabilities: expect.objectContaining({ pdf: true }),
      }),
    );
    expect(recommendationResponse.status).toBe(200);
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
    const visualResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/benchmarks?useCase=document-processing&minVisualReasoning=70&maxImageInputCostPer1kImagesAud=5",
      ),
      env(),
      ctx,
    );
    const visualBody = (await visualResponse.json()) as JsonObject;
    const aliasResponse = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/benchmarks?useCase=document-processing&provider=google&maxImageInputCostPer1kImages=5",
      ),
      env(),
      ctx,
    );
    const aliasBody = (await aliasResponse.json()) as JsonObject;
    const normalized = (value: number | undefined) =>
      typeof value === "number" ? (value <= 1 ? value * 100 : value) : -Infinity;

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
          pricing: { imageInputPer1kImages?: number };
        }) =>
          row.provider === "google" &&
          typeof row.benchmarks.llm?.visualReasoning === "number" &&
          (row.benchmarks.llm.intelligence ?? Number.NEGATIVE_INFINITY) >=
            30 &&
          (row.benchmarks.llm.intelligenceCostPerTask ??
            Number.POSITIVE_INFINITY) <= 1,
      ),
    ).toBe(true);
    expect(visualResponse.status).toBe(200);
    expect(visualBody.benchmarkCount).toBeGreaterThan(0);
    expect(
      visualBody.benchmarks.every(
        (row: {
          benchmarks: { llm?: { visualReasoning?: number } };
          pricing: { imageInputPer1kImages?: number };
        }) =>
          normalized(row.benchmarks.llm?.visualReasoning) >= 70 &&
          (row.pricing.imageInputPer1kImages ?? Number.POSITIVE_INFINITY) <= 5,
      ),
    ).toBe(true);
    expect(aliasResponse.status).toBe(200);
    expect(aliasBody.benchmarkCount).toBeGreaterThan(0);
    expect(
      aliasBody.benchmarks.every(
        (row: { pricing: { imageInputPer1kImages?: number } }) =>
          (row.pricing.imageInputPer1kImages ?? Number.POSITIVE_INFINITY) <= 5,
      ),
    ).toBe(true);
  });

  it("serves registry models independently from benchmark rows", async () => {
    const [response, benchmarkResponse] = await Promise.all([
      handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models?provider=anthropic&capability=pdf",
      ),
      env(),
      ctx,
      ),
      handleRequest(
        new Request(
          "https://ai.itsolver.au/v1/benchmarks?provider=anthropic",
        ),
        env(),
        ctx,
      ),
    ]);
    const body = (await response.json()) as JsonObject;
    const benchmarkBody = (await benchmarkResponse.json()) as JsonObject;
    expect(response.status).toBe(200);
    expect(benchmarkResponse.status).toBe(200);
    expect(body.modelCount).toBe(1);
    expect(body.models[0]).toMatchObject({
      id: "claude-fable-5",
      provider: "anthropic",
      capabilities: { pdf: true },
    });
    expect(body.models[0].source).toBeUndefined();
    expect(benchmarkBody.benchmarks).toContainEqual(
      expect.objectContaining({
        id: "claude-fable-5-high",
        registryModelId: "claude-fable-5",
        source: "artificialanalysis",
      }),
    );
    expect(
      benchmarkBody.benchmarks.map((row: { id: string }) => row.id),
    ).not.toEqual(body.models.map((row: { id: string }) => row.id));
  });

  it("shows beta registry models while keeping their AA variants ineligible", async () => {
    const betaSource = structuredClone(modelsDevFixture) as any;
    betaSource.anthropic.models["claude-fable-5"].status = "beta";
    const betaEnv = {
      ...env(),
      MODELS_DEV_URL:
        "data:application/json," +
        encodeURIComponent(JSON.stringify(betaSource)),
    };
    const [registryResponse, benchmarkResponse] = await Promise.all([
      handleRequest(
        new Request("https://ai.itsolver.au/v1/models?provider=anthropic"),
        betaEnv,
        ctx,
      ),
      handleRequest(
        new Request(
          "https://ai.itsolver.au/v1/benchmarks?provider=anthropic&useCase=customer-support&includeItsBenchmark=false",
        ),
        betaEnv,
        ctx,
      ),
    ]);
    const registryBody = (await registryResponse.json()) as JsonObject;
    const benchmarkBody = (await benchmarkResponse.json()) as JsonObject;

    expect(registryResponse.status).toBe(200);
    expect(registryBody.models).toContainEqual(
      expect.objectContaining({
        id: "claude-fable-5",
        availability: expect.objectContaining({ status: "beta" }),
      }),
    );
    expect(benchmarkResponse.status).toBe(200);
    expect(benchmarkBody.benchmarks).toContainEqual(
      expect.objectContaining({
        id: "claude-fable-5-high",
        recommendable: false,
        eligibilityReason: "beta",
      }),
    );
  });

  it("uses highest visual reasoning for document-processing best recommendations", async () => {
    const query =
      "useCase=document-processing&maxIntelligenceCostPerTaskAud=5&minIntelligence=30&minVisualReasoning=70&maxImageInputCostPer1kImagesAud=10";
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
    const failoverFamily = (row: JsonObject) =>
      `${row.provider}:${String(row.name)
        .toLowerCase()
        .replace(
          /\s*\((?:minimal|low|medium|high|xhigh|reasoning|non-reasoning|thinking|adaptive reasoning|high effort|max effort)\)\s*/g,
          " ",
        )
        .replace(/\b(?:minimal|low|medium|high|xhigh)\b/g, " ")
        .replace(/[^a-z0-9]+/g, " ")
        .trim()}`;
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
    const failover = eligible
      .slice(1)
      .find(
        (row: JsonObject) => failoverFamily(row) !== failoverFamily(eligible[0]),
      );

    expect(rowsResponse.status).toBe(200);
    expect(recommendationResponse.status).toBe(200);
    expect(eligible.length).toBeGreaterThan(1);
    expect(recommendationBody.recommendation.id).toBe(eligible[0].id);
    expect(recommendationBody.recommendation.failover.id).toBe(failover?.id);
    expect(recommendationBody.recommendation.failover).not.toHaveProperty(
      "failover",
    );
    expect(
      normalized(recommendationBody.recommendation.benchmarks.llm.visualReasoning),
    ).toBeGreaterThanOrEqual(70);
    expect(
      recommendationBody.recommendation.pricing.imageInputPer1kImages,
    ).toBeLessThanOrEqual(10);
  });

  it("keeps nested recommendation failover within the requested provider", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=document-processing&provider=openai&tier=fast&minIntelligence=30",
      ),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.recommendation.provider).toBe("openai");
    expect(body.recommendation.failover).toMatchObject({
      provider: "openai",
    });
  });

  it("does not use a same-family variant as a nested recommendation failover", async () => {
    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=document-processing&provider=google&tier=fast&minIntelligence=30",
      ),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.recommendation.id).toBe("gemini-3-5-flash");
    expect(body.recommendation.failover).toBeNull();
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
    expect(body.recommendation.failover).toMatchObject({ id: "safe" });
    expect(body.recommendation.failover).not.toHaveProperty("failover");
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
    expect(body.recommendation.failover).toMatchObject({
      id: "next-cheapest",
    });
    expect(body.failovers.map((model: { id: string }) => model.id)).toEqual([
      "next-cheapest",
      "third-cheapest",
    ]);
    expect(body.failoverStatus).toEqual({
      requested: 2,
      returned: 2,
    });
  });

  it("deduplicates customer-support failovers by base model", async () => {
    const primary = supportCandidate("primary", 0, 0.9, 50, 1);
    primary.name = "GPT-5 mini (medium)";
    primary.registryModelId = "gpt-5-mini";

    const grokHigh = supportCandidate("grok-4-3", 1, 0.9, 100, 1);
    grokHigh.provider = "xai";
    grokHigh.name = "Grok 4.3 (high)";
    grokHigh.family = "grok";
    grokHigh.registryModelId = "grok-4.3";

    const grokLow = supportCandidate("grok-4-3-low", 2, 0.9, 110, 1);
    grokLow.provider = "xai";
    grokLow.name = "Grok 4.3 (low)";

    const distinct = supportCandidate("gpt-5-4-low", 3, 0.9, 120, 1);
    distinct.name = "GPT-5.4 (low)";
    distinct.registryModelId = "gpt-5.4";

    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=customer-support&tier=fast&capability=reasoning",
      ),
      envWithCachedCatalog(
        supportCatalog([primary, grokHigh, grokLow, distinct]),
      ),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.recommendation.id).toBe("primary");
    expect(body.recommendation.failover).toMatchObject({ id: "grok-4-3" });
    expect(body.failovers.map((model: { id: string }) => model.id)).toEqual([
      "grok-4-3",
      "gpt-5-4-low",
    ]);
    expect(body.failoverStatus).toEqual({
      requested: 2,
      returned: 2,
    });
  });

  it("reports a shortage of distinct customer-support model families", async () => {
    const primary = supportCandidate("primary", 0, 0.9, 50, 1);
    primary.name = "GPT-5 mini (medium)";
    primary.registryModelId = "gpt-5-mini";

    const grokHigh = supportCandidate("grok-4-3", 1, 0.9, 100, 1);
    grokHigh.provider = "xai";
    grokHigh.name = "Grok 4.3 (high)";
    grokHigh.registryModelId = "grok-4.3";

    const grokLow = supportCandidate("grok-4-3-low", 2, 0.9, 110, 1);
    grokLow.provider = "xai";
    grokLow.name = "Grok 4.3 (low)";

    const response = await handleRequest(
      new Request(
        "https://ai.itsolver.au/v1/models/recommend?useCase=customer-support&tier=fast&capability=reasoning",
      ),
      envWithCachedCatalog(supportCatalog([primary, grokHigh, grokLow])),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.failovers.map((model: { id: string }) => model.id)).toEqual([
      "grok-4-3",
    ]);
    expect(body.failoverStatus).toEqual({
      requested: 2,
      returned: 1,
      reason: "insufficient_distinct_model_families",
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
    expect(body.recommendation.failover).toBeNull();
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
        eligibilityReason: "eligible",
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
    const incompleteRows = body.benchmarks.filter((row: { id: string }) =>
      row.id.includes("missing"),
    );
    expect(incompleteRows.length).toBeGreaterThan(0);
    expect(
      incompleteRows.every(
        (row: { recommendable: boolean; eligibilityReason?: string }) =>
          !row.recommendable &&
          typeof row.eligibilityReason === "string" &&
          row.eligibilityReason !== "eligible",
      ),
    ).toBe(true);
    expect(incompleteRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringContaining("missing-price"),
          eligibilityReason: "missing_transcription_pricing",
        }),
        expect.objectContaining({
          id: expect.stringContaining("missing-wer"),
          eligibilityReason: "missing_aa_wer",
        }),
      ]),
    );
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

  it("serves speech-to-text benchmark browse rows", async () => {
    const response = await handleRequest(
      new Request("https://ai.itsolver.au/v1/benchmarks?useCase=speech-to-text"),
      env(),
      ctx,
    );
    const body = (await response.json()) as JsonObject;

    expect(response.status).toBe(200);
    expect(body.benchmarks).toContainEqual(
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
    expect(body.benchmarks.map((row: { id: string }) => row.id)).not.toContain(
      "google-gemini-2-0-flash-lite",
    );
    expect(body.benchmarks.map((row: { id: string }) => row.id)).not.toContain(
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
    expect(defaultCappedBody.recommendation.failover).toMatchObject({
      benchmarks: { speechToText: expect.any(Object) },
    });
    expect(defaultCappedBody.recommendation.failover).not.toHaveProperty(
      "failover",
    );
    expect(cappedGroqVisibleResponse.status).toBe(200);
    expect(cappedGroqVisibleBody.recommendation).toMatchObject({
      id: "groq-whisper-large-v3-turbo",
      provider: "groq",
    });
    expect(cappedGroqVisibleBody.recommendation.failover).toBeNull();
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
    ).toEqual(["openai", "google", "xai", "anthropic", "nvidia", "groq"]);
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
