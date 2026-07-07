import { describe, expect, it } from "vitest";
import {
  benchmarkCandidates,
  normalizeArtificialAnalysisCatalog,
  parseFilters,
  recommendModel,
  recommendModelFailovers,
  type BenchmarkCandidate,
  type Catalog,
} from "../src/registry";
import { AA_LLM_EFFICIENCY_MODELS } from "../src/generated/aa-llm-efficiency";
import { AI_AUTOCLOSE_BENCHMARKS } from "../src/generated/ai-autoclose-benchmarks";
import {
  artificialAnalysisFixture,
  artificialAnalysisSpeechToTextFixture,
} from "./fixtures";

function aaSupportScore(candidate: BenchmarkCandidate): number {
  const signals = candidate.benchmarks.llm ?? {};
  if (typeof signals.customerSupportRank === "number") {
    return Math.max(0, 102 - signals.customerSupportRank * 2);
  }

  const weightedSignal = (
    values: Array<[number | undefined, number]>,
    fallback: number,
  ) => {
    let total = 0;
    let weight = 0;
    for (const [value, itemWeight] of values) {
      if (typeof value !== "number") continue;
      total += value * itemWeight;
      weight += itemWeight;
    }
    return weight ? total / weight : fallback;
  };
  const blendedPrice =
    (candidate.pricing.inputPerMTok ?? 100) * 0.4 +
    (candidate.pricing.outputPerMTok ?? 100) * 0.6;
  const priceScore =
    100 - Math.min(Math.log1p(blendedPrice) / Math.log1p(100), 1) * 100;
  const benchmarkCost = signals.intelligenceCostPerTask;
  const runCostScore =
    typeof benchmarkCost === "number"
      ? 100 -
        Math.min(Math.log1p(benchmarkCost) / Math.log1p(2), 1) * 100
      : typeof signals.intelligenceRunTotalCost === "number"
      ? 100 -
        Math.min(
          Math.log1p(signals.intelligenceRunTotalCost) / Math.log1p(100_000),
          1,
        ) *
          100
      : undefined;
  const textCostScore = weightedSignal(
    [
      [runCostScore, 0.55],
      [priceScore, 0.2],
    ],
    priceScore,
  );
  const runCostValue =
    typeof benchmarkCost === "number"
      ? Math.max(
          0,
          100 - Math.min(Math.log1p(benchmarkCost) / Math.log1p(2), 1) * 100,
        )
      : typeof signals.intelligenceRunTotalCost === "number"
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
  const efficiencyScore = runCostValue ?? 50;
  const quality = weightedSignal(
    [
      [signals.agentic ?? signals.tauTelecom, 0.25],
      [signals.instructionFollowing, 0.3],
      [signals.intelligence, 0.25],
      [signals.professional, 0.1],
    ],
    60,
  );

  return (
    quality * 0.62 +
    textCostScore * 0.2 +
    efficiencyScore * 0.1 +
    Math.min((signals.speed ?? 0) / 220, 1) * 8
  );
}

function aaSupportMedian(candidates: BenchmarkCandidate[]): BenchmarkCandidate {
  const ordered = [...candidates].sort(
    (left, right) => aaSupportScore(right) - aaSupportScore(left),
  );
  return ordered[Math.floor((ordered.length - 1) / 2)];
}

describe("filter parsing", () => {
  it("parses supported filters and legacy use-case aliases", () => {
    const filters = parseFilters(
      new URLSearchParams(
        "useCase=customer-support&minCostPerMTok=1&maxCostPerMTok=2&minOutputCostPerMTok=4&maxOutputCostPerMTok=8&minRunCostAud=100&maxRunCostAud=500&minIntelligence=30&maxContextWindow=1000000",
      ),
    );

    expect(filters).toMatchObject({
      useCase: "customer-support",
      minInputCostPerMTok: 1,
      maxInputCostPerMTok: 2,
      minOutputCostPerMTok: 4,
      maxOutputCostPerMTok: 8,
      minRunCostAud: 100,
      maxRunCostAud: 500,
      minIntelligence: 30,
      maxContextWindow: 1000000,
      includeItsBenchmark: true,
    });
    expect(
      parseFilters(
        new URLSearchParams(
          "useCase=customer-support&maxRunCostUsd=900&minIntelligenceCostPerTaskAud=0.1&maxIntelligenceCostPerTaskUsd=0.5&allowPreview=true",
        ),
      ),
    ).toMatchObject({
      useCase: "customer-support",
      maxRunCostUsd: 900,
      minIntelligenceCostPerTaskAud: 0.1,
      maxIntelligenceCostPerTaskUsd: 0.5,
      allowPreview: true,
    });
    expect(
      parseFilters(new URLSearchParams("includeItsBenchmark=false"))
        .includeItsBenchmark,
    ).toBe(false);
    expect(
      parseFilters(new URLSearchParams("includeItsEval=false"))
        .includeItsBenchmark,
    ).toBe(false);
    expect(parseFilters(new URLSearchParams("useCase=support")).useCase).toBe(
      "customer-support",
    );
    expect(
      parseFilters(new URLSearchParams("useCase=document-processing")).useCase,
    ).toBe("document-processing");
    expect(parseFilters(new URLSearchParams("useCase=ocr")).useCase).toBe(
      "document-processing",
    );
    expect(
      parseFilters(new URLSearchParams("useCase=document-ocr")).useCase,
    ).toBe("document-processing");
    expect(
      parseFilters(new URLSearchParams("useCase=billing-incident")),
    ).toMatchObject({
      useCase: "customer-support",
    });
    expect(parseFilters(new URLSearchParams("useCase=stt"))).toMatchObject({
      useCase: "speech-to-text",
    });
    expect(
      parseFilters(new URLSearchParams("useCase=speech-to-speech")),
    ).toMatchObject({
      useCase: "voice",
    });
    expect(
      parseFilters(new URLSearchParams("useCase=speech-to-speech-voice")),
    ).toMatchObject({
      useCase: "voice",
    });
    expect(
      parseFilters(
        new URLSearchParams(
          "provider=groq&maxTranscriptionCostPer1kMinutes=5&maxAaWer=3",
        ),
      ),
    ).toMatchObject({
      provider: "groq",
      maxTranscriptionCostPer1kMinutes: 5,
      maxAaWer: 3,
    });
    expect(
      parseFilters(
        new URLSearchParams(
          "useCase=document-processing&minVisualReasoning=70&maxImageInputCostPer1kImagesAud=4.5",
        ),
      ),
    ).toMatchObject({
      useCase: "document-processing",
      minVisualReasoning: 70,
      maxImageInputCostPer1kImagesAud: 4.5,
    });
    expect(
      parseFilters(
        new URLSearchParams(
          "useCase=ocr&maxImageInputCostPer1kImages=2.5",
        ),
      ),
    ).toMatchObject({
      useCase: "document-processing",
      maxImageInputCostPer1kImagesAud: 2.5,
    });
    expect(
      parseFilters(new URLSearchParams("provider=deepgram")),
    ).toMatchObject({
      unsupportedProvider: true,
    });
  });
});

describe("Artificial Analysis catalog", () => {
  const customerSupportCost = (candidate: BenchmarkCandidate | undefined) =>
    candidate?.benchmarks.llm?.intelligenceCostPerTask ??
    candidate?.benchmarks.llm?.intelligenceRunTotalCost ??
    Number.POSITIVE_INFINITY;

  it("builds an AA-only catalog without registry models", () => {
    const catalog = normalizeArtificialAnalysisCatalog(
      "2026-05-19T00:00:00Z",
      undefined,
      artificialAnalysisFixture.data,
    );

    expect(catalog.models).toEqual([]);
    expect(catalog.modelCount).toBeGreaterThan(0);
    expect(catalog.providers.map((provider) => provider.provider)).toEqual([
      "openai",
      "google",
      "xai",
      "anthropic",
      "nvidia",
      "elevenlabs",
      "groq",
    ]);
  });

  it("includes supported-provider AA rows and excludes unsupported providers", () => {
    const catalog = normalizeArtificialAnalysisCatalog(
      "2026-05-19T00:00:00Z",
      undefined,
      artificialAnalysisFixture.data,
    );
    const rows = benchmarkCandidates(catalog, { useCase: "customer-support" });
    const ids = rows.map((row) => row.id);

    expect(ids).toContain("gemini-fast");
    expect(ids).toContain("grok-4-3");
    expect(ids).not.toContain("grok-4.20-multi-agent-0309");
    expect(ids).not.toContain("gemini-2.0-flash-lite");
    expect(ids).not.toContain("unsupported-model");
    expect(benchmarkCandidates(catalog, {}).map((row) => row.id)).not.toContain(
      "gemini-2.0-flash-lite",
    );
  });

  it("displays AA-only rows without pricing but does not recommend them", () => {
    const catalog = normalizeArtificialAnalysisCatalog(
      "2026-05-19T00:00:00Z",
      undefined,
      artificialAnalysisFixture.data,
    );
    const geminiFast = benchmarkCandidates(catalog, {
      provider: "google",
      useCase: "customer-support",
    }).find((row) => row.id === "gemini-fast");

    expect(geminiFast?.recommendable).toBe(false);
    expect(geminiFast?.pricing).toEqual({});
  });

  it("merges cached AA pricing into benchmark rows by slug", () => {
    const catalog = normalizeArtificialAnalysisCatalog("2026-05-19T00:00:00Z", {
      base: "USD",
      quote: "AUD",
      rate: 2,
      source: "test",
    });
    const grok = benchmarkCandidates(catalog, {
      provider: "xai",
      useCase: "customer-support",
    }).find((row) => row.id === "grok-4-3");

    expect(grok).toMatchObject({
      provider: "xai",
      recommendable: true,
      pricing: {
        inputPerMTok: 2.5,
        outputPerMTok: 5,
        cacheReadPerMTok: 0.4,
      },
    });
    expect(grok?.registryModelId).toBeUndefined();
  });

  it("allows AA-origin rows with real token pricing to be recommended", () => {
    const catalog = normalizeArtificialAnalysisCatalog(
      "2026-05-19T00:00:00Z",
      undefined,
      artificialAnalysisFixture.data,
    );

    const recommendation = recommendModel(catalog, {
      provider: "xai",
      useCase: "customer-support",
      tier: "best",
    });

    expect(recommendation).toMatchObject({
      provider: "xai",
      recommendable: true,
      source: "artificialanalysis",
    });
    expect(recommendation?.pricing.inputPerMTok).toBeGreaterThan(0);
    expect(recommendation?.pricing.outputPerMTok).toBeGreaterThan(0);
  });

  it("uses refreshed customer-support rows with auto-close benchmark data", () => {
    const catalog = normalizeArtificialAnalysisCatalog(
      "2026-05-19T00:00:00Z",
      undefined,
      artificialAnalysisFixture.data,
    );
    const openaiRecommendation = recommendModel(catalog, {
      provider: "openai",
      useCase: "customer-support",
    });
    const gpt55Low = benchmarkCandidates(catalog, {
      provider: "openai",
      useCase: "customer-support",
    }).find((row) => row.id === "gpt-5-5-low");
    const googlePreviewRecommendation = recommendModel(catalog, {
      provider: "google",
      useCase: "customer-support",
    });
    const fastRecommendation = recommendModel(catalog, {
      useCase: "customer-support",
      tier: "fast",
    });
    const balancedRecommendation = recommendModel(catalog, {
      useCase: "customer-support",
      tier: "balanced",
    });
    const bestRecommendation = recommendModel(catalog, {
      useCase: "customer-support",
      tier: "best",
    });
    const filteredGoogleBestRecommendation = recommendModel(catalog, {
      provider: "google",
      useCase: "customer-support",
      tier: "best",
      capability: "reasoning",
      maxRunCostAud: 1300,
      minIntelligence: 30,
    });

    expect(recommendModel(catalog, { useCase: "customer-support" })?.id).toBe(
      fastRecommendation?.id,
    );
    expect(
      customerSupportCost(fastRecommendation as BenchmarkCandidate | undefined),
    ).toBeLessThanOrEqual(
      customerSupportCost(bestRecommendation as BenchmarkCandidate | undefined),
    );
    const falsePositiveRate = (
      candidate:
        | {
            benchmarks?: {
              llm?: {
                autoClose?: { total: number; falsePositiveCount: number };
              };
            };
          }
        | undefined,
    ) => {
      const autoClose = candidate?.benchmarks?.llm?.autoClose;
      if (!autoClose || autoClose.total <= 0) return Number.POSITIVE_INFINITY;
      return autoClose.falsePositiveCount / autoClose.total;
    };
    expect(falsePositiveRate(bestRecommendation)).toBeLessThanOrEqual(
      falsePositiveRate(fastRecommendation),
    );
    expect(filteredGoogleBestRecommendation).toBeUndefined();
    expect(openaiRecommendation).toMatchObject({
      provider: "openai",
      recommendable: true,
      pricing: expect.objectContaining({
        inputPerMTok: expect.any(Number),
        outputPerMTok: expect.any(Number),
      }),
      benchmarks: {
        llm: expect.objectContaining({
          intelligenceCostPerTask: expect.any(Number),
          autoClose: expect.objectContaining({
            falsePositiveCount: expect.any(Number),
            accuracy: expect.any(Number),
            sourceUrl: expect.any(String),
            verifiedOn: expect.any(String),
          }),
        }),
      },
    });
    expect(gpt55Low).toMatchObject({
      contextWindow: 922000,
      benchmarks: {
        llm: {
          customerSupportRank: 6,
          instructionFollowing: expect.any(Number),
          agentic: expect.any(Number),
          autoClose: expect.objectContaining({
            falsePositiveCount: 5,
            benchmarkReport: "AI_AUTOCLOSE_CODEX_GPT_5_5_LOW.md",
          }),
        },
      },
    });
    expect(googlePreviewRecommendation).toBeUndefined();
  });

  it("tracks curated ITS auto-close rows for model-table joins", () => {
    const byId = new Map(AI_AUTOCLOSE_BENCHMARKS.map((row) => [row.id, row]));

    expect(byId.get("gpt-5-4-low")).toMatchObject({
      modelKey: "codex:gpt-5.4-low",
      total: 81,
      falsePositiveCount: 0,
      falseNegativeCount: 16,
      invalidCount: 0,
    });
    expect(byId.get("gemini-3-flash-reasoning")).toMatchObject({
      modelKey: "gemini:gemini-3-flash-preview",
      total: 43,
      falsePositiveCount: 1,
      invalidCount: 0,
      benchmarkReport: "AI_AUTOCLOSE_GEMINI_MODEL_BENCHMARK.md",
      availability: expect.objectContaining({
        status: "preview",
        acceptedRisk: false,
      }),
    });
    expect(byId.get("gemini-3-1-flash-lite-preview")).toMatchObject({
      modelKey: "gemini:gemini-3.1-flash-lite-preview",
      total: 43,
      deprecated: true,
      falsePositiveCount: 1,
      invalidCount: 0,
      availability: expect.objectContaining({
        status: "retired",
        acceptedRisk: false,
      }),
    });
    expect(byId.get("gemini-2-5-flash-lite")).toMatchObject({
      modelKey: "gemini:gemini-2.5-flash-lite",
      total: 43,
      falsePositiveCount: 3,
      accuracy: 0.8604651162790697,
      availability: expect.objectContaining({
        acceptedRisk: false,
      }),
    });
    expect(byId.get("gpt-5-mini")).toMatchObject({
      falsePositiveCount: 0,
      invalidCount: 18,
    });
    expect(byId.get("grok-4-1-fast-reasoning")).toMatchObject({
      falsePositiveCount: 0,
      falseNegativeCount: 2,
      invalidCount: 2,
      availability: expect.objectContaining({
        status: "retired",
      }),
    });
    expect(byId.get("grok-4-3")).toMatchObject({
      modelKey: "xai:grok-4-3-high",
      total: 109,
      falsePositiveCount: 8,
      invalidCount: 0,
      benchmarkReport: "AI_AUTOCLOSE_GROK_PAID_BENCHMARK.md",
    });
    expect(byId.get("grok-4-3-medium")).toMatchObject({
      modelKey: "xai:grok-4-3-medium",
      total: 109,
      falsePositiveCount: 7,
      invalidCount: 0,
    });
    expect(byId.get("grok-4-3-low")).toMatchObject({
      modelKey: "xai:grok-4-3-low",
      total: 109,
      falsePositiveCount: 7,
      invalidCount: 0,
    });
    expect(byId.get("gemma-4-26b-a4b-it")).toMatchObject({
      modelKey: "gemini:gemma-4-26b-a4b-it",
      total: 109,
      falsePositiveCount: 5,
      invalidCount: 0,
      availability: expect.objectContaining({
        status: "unknown",
        acceptedRisk: false,
      }),
    });
  });

  it("uses customer-support recommendation priorities for cost, safety, and balance", () => {
    const autoClose = (falsePositiveCount: number, accuracy: number) => ({
      source: "itsolver-autoclose" as const,
      modelKey: "test:model",
      apiModel: "test-model",
      displayName: "Test Model",
      benchmarkReport: "test.md",
      resultsFile: "test.json",
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
        status: "production" as const,
        acceptedRisk: false,
        reason: "test",
      },
    });
    const candidate = (
      id: string,
      falsePositiveCount: number,
      accuracy: number,
      runCost: number,
      outputPerMTok: number,
      taskCost: number,
    ): BenchmarkCandidate => ({
      id,
      provider: "openai",
      name: id,
      source: "artificialanalysis",
      benchmarks: {
        llm: {
          instructionFollowing: 80,
          intelligence: 80,
          intelligenceRunTotalCost: runCost,
          intelligenceCostPerTask: taskCost,
          autoClose: autoClose(falsePositiveCount, accuracy),
        },
      },
      pricing: { inputPerMTok: 1, outputPerMTok },
      recommendable: true,
      family: null,
      contextWindow: null,
      outputLimit: null,
      capabilities: null,
      modalities: null,
      openWeights: null,
      tier: null,
      deprecated: null,
      updatedAt: null,
    });
    const catalog: Catalog = {
      generatedAt: "2026-05-22T00:00:00Z",
      modelCount: 5,
      activeModelCount: 5,
      providers: [{ provider: "openai", total: 5, active: 5 }],
      models: [],
      benchmarkCandidates: [
        candidate("safest", 0, 0.91, 500, 20, 0.5),
        candidate("safe", 1, 0.92, 400, 20, 0.4),
        candidate("middle", 2, 0.93, 300, 20, 0.3),
        candidate("risky", 3, 0.99, 50, 20, 0.2),
        candidate("cheapest", 4, 0.99, 450, 1, 0.05),
      ],
    };

    expect(recommendModel(catalog, { useCase: "customer-support" })?.id).toBe(
      "cheapest",
    );
    expect(
      recommendModel(catalog, { useCase: "customer-support", tier: "balanced" })
        ?.id,
    ).toBe("middle");
    expect(
      recommendModel(catalog, { useCase: "customer-support", tier: "fast" })
        ?.id,
    ).toBe("cheapest");
    expect(
      recommendModel(catalog, { useCase: "customer-support", tier: "best" })
        ?.id,
    ).toBe("safest");
    expect(
      recommendModelFailovers(catalog, {
        useCase: "customer-support",
        tier: "best",
      }).map((model) => model.id),
    ).toEqual(["safe", "middle"]);
    expect(
      recommendModelFailovers(catalog, {
        useCase: "customer-support",
        tier: "fast",
      }).map((model) => model.id),
    ).toEqual(["risky", "middle"]);
    expect(
      recommendModel(catalog, {
        useCase: "customer-support",
        tier: "fast",
        maxRunCostAud: 250,
      })?.id,
    ).toBe("risky");
    expect(
      recommendModel(catalog, {
        useCase: "customer-support",
        tier: "fast",
        maxIntelligenceCostPerTaskAud: 0.1,
      })?.id,
    ).toBe("cheapest");
  });

  it("uses visual reasoning first for document-processing highest accuracy", () => {
    const candidate = (
      id: string,
      visualReasoning: number,
      imageCost: number,
      visualLatency: number,
      capabilities = { vision: true, reasoning: true },
    ): BenchmarkCandidate => ({
      id,
      provider: "openai",
      name: id,
      source: "artificialanalysis",
      benchmarks: {
        llm: {
          visualReasoning,
          instructionFollowing: 70,
          intelligence: 60,
          visualLatency,
          intelligenceCostPerTask: 0.3,
        },
      },
      pricing: {
        inputPerMTok: 1,
        outputPerMTok: 4,
        imageInputPer1kImages: imageCost,
      },
      recommendable: true,
      availability: {
        status: "production",
        acceptedRisk: false,
        reason: "test",
      },
      family: null,
      contextWindow: 500_000,
      outputLimit: null,
      capabilities: {
        vision: capabilities.vision,
        reasoning: capabilities.reasoning,
        pdf: false,
        toolCalling: false,
        structuredOutput: false,
      },
      modalities: null,
      openWeights: null,
      tier: null,
      deprecated: null,
      updatedAt: null,
    });
    const catalog: Catalog = {
      generatedAt: "2026-07-07T00:00:00Z",
      modelCount: 4,
      activeModelCount: 4,
      providers: [{ provider: "openai", total: 4, active: 4 }],
      models: [],
      benchmarkCandidates: [
        candidate("cheap-fast", 0.7, 0.2, 0.5),
        candidate("highest-visual", 0.92, 4, 4),
        candidate("middle", 0.8, 1, 1),
        candidate("vision-only", 0.99, 0.1, 0.1, {
          vision: true,
          reasoning: false,
        }),
      ],
    };

    const rows = benchmarkCandidates(catalog, {
      useCase: "document-processing",
    });
    expect(rows.map((row) => row.id)).toEqual(
      expect.arrayContaining(["highest-visual", "vision-only"]),
    );
    expect(
      recommendModel(catalog, {
        useCase: "document-processing",
        tier: "best",
      })?.id,
    ).toBe("highest-visual");
    expect(
      recommendModel(catalog, {
        useCase: "document-processing",
        tier: "fast",
      })?.id,
    ).toBe("cheap-fast");
    expect(
      recommendModel(catalog, {
        useCase: "document-processing",
        tier: "best",
        minVisualReasoning: 75,
        maxImageInputCostPer1kImagesAud: 1,
      })?.id,
    ).toBe("middle");
  });

  it("applies document-processing provider, cost, and intelligence filters", () => {
    const row = (
      id: string,
      provider: "openai" | "google",
      taskCost: number,
      intelligence: number,
      visualReasoning = 0.8,
      imageCost = 0.5,
    ): BenchmarkCandidate => ({
      id,
      provider,
      name: id,
      source: "artificialanalysis",
      benchmarks: {
        llm: {
          visualReasoning,
          instructionFollowing: 75,
          intelligence,
          intelligenceCostPerTask: taskCost,
        },
      },
      pricing: {
        inputPerMTok: 1,
        outputPerMTok: 3,
        imageInputPer1kImages: imageCost,
      },
      recommendable: true,
      availability: {
        status: "production",
        acceptedRisk: false,
        reason: "test",
      },
      family: null,
      contextWindow: 250_000,
      outputLimit: null,
      capabilities: {
        vision: true,
        reasoning: true,
        pdf: false,
        toolCalling: false,
        structuredOutput: false,
      },
      modalities: null,
      openWeights: null,
      tier: null,
      deprecated: null,
      updatedAt: null,
    });
    const catalog: Catalog = {
      generatedAt: "2026-07-07T00:00:00Z",
      modelCount: 5,
      activeModelCount: 5,
      providers: [
        { provider: "openai", total: 1, active: 1 },
        { provider: "google", total: 4, active: 4 },
      ],
      models: [],
      benchmarkCandidates: [
        row("openai-row", "openai", 0.2, 80, 0.95, 0.2),
        row("google-cheap", "google", 0.4, 78, 0.9, 0.5),
        row("google-expensive", "google", 2, 90, 0.95, 0.5),
        row("google-low-visual", "google", 0.3, 85, 0.7, 0.5),
        row("google-image-expensive", "google", 0.3, 85, 0.91, 2),
      ],
    };

    const rows = benchmarkCandidates(catalog, {
      useCase: "document-processing",
      provider: "google",
      maxIntelligenceCostPerTaskAud: 1,
      minIntelligence: 70,
      minVisualReasoning: 85,
      maxImageInputCostPer1kImagesAud: 1,
    });

    expect(rows.map((item) => item.id)).toEqual(["google-cheap"]);
  });

  it("uses the AA support-score median for AA-only customer-support balance", () => {
    const candidate = (
      id: string,
      rank: number,
      outputPerMTok = 5,
    ): BenchmarkCandidate => ({
      id,
      provider: "openai",
      name: id,
      source: "artificialanalysis",
      benchmarks: {
        llm: {
          customerSupportRank: rank,
          instructionFollowing: 70,
          agentic: 60,
          intelligence: 50,
          intelligenceRunTotalCost: 100 + rank,
        },
      },
      pricing: { inputPerMTok: 1, outputPerMTok },
      recommendable: true,
      family: null,
      contextWindow: null,
      outputLimit: null,
      capabilities: {
        vision: true,
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
    });
    const catalog: Catalog = {
      generatedAt: "2026-06-06T00:00:00Z",
      modelCount: 5,
      activeModelCount: 5,
      providers: [{ provider: "openai", total: 5, active: 5 }],
      models: [],
      benchmarkCandidates: [
        candidate("aa-score-1", 1),
        candidate("aa-score-2", 2),
        candidate("aa-score-3", 3),
        candidate("aa-score-4", 4),
        candidate("aa-score-5", 5, 1),
      ],
    };

    expect(
      recommendModel(catalog, {
        useCase: "customer-support",
        tier: "best",
        includeItsBenchmark: false,
      })?.id,
    ).toBe("aa-score-1");
    expect(
      recommendModel(catalog, {
        useCase: "customer-support",
        tier: "balanced",
        includeItsBenchmark: false,
      })?.id,
    ).toBe("aa-score-3");
  });

  it("does not recommend deprecated or retired customer-support models by default", () => {
    const safeCandidate = {
      id: "safe-model",
      provider: "openai",
      name: "Safe Model",
      source: "artificialanalysis",
      benchmarks: {
        llm: {
          instructionFollowing: 99,
          intelligenceRunTotalCost: 100,
          autoClose: {
            source: "itsolver-autoclose",
            modelKey: "openai:safe-model",
            apiModel: "safe-model",
            displayName: "Safe Model",
            benchmarkReport: "safe.md",
            resultsFile: "safe.json",
            generatedAt: "2026-05-22T00:00:00Z",
            benchmarkCodeSha: "test",
            total: 100,
            correctCount: 90,
            accuracy: 0.9,
            falsePositiveCount: 1,
            falseNegativeCount: 9,
            invalidCount: 0,
            errorCount: 0,
            parseSuccessRate: 1,
            avgLatencyMs: 1000,
            p95LatencyMs: 1200,
            avgInputTokens: 1000,
            avgOutputTokens: 100,
            weightedScore: 55,
            sourceUrl: "https://example.test/safe",
            verifiedOn: "2026-05-22",
            availability: {
              status: "production",
              acceptedRisk: false,
              reason: "test",
            },
          },
        },
      },
      pricing: { inputPerMTok: 1, outputPerMTok: 1 },
      recommendable: true,
      family: null,
      contextWindow: null,
      outputLimit: null,
      capabilities: null,
      modalities: null,
      openWeights: null,
      tier: null,
      deprecated: null,
      updatedAt: null,
    } as const;
    const riskyBenchmarks = {
      llm: {
        instructionFollowing: 100,
        intelligenceRunTotalCost: 1,
        autoClose: {
          ...safeCandidate.benchmarks.llm.autoClose,
          falsePositiveCount: 0,
          accuracy: 1,
          weightedScore: 100,
          availability: {
            status: "retired",
            acceptedRisk: false,
            reason: "test retired model",
          },
        },
      },
    } as const;
    const catalog: Catalog = {
      generatedAt: "2026-05-22T00:00:00Z",
      modelCount: 3,
      activeModelCount: 3,
      providers: [{ provider: "openai", total: 3, active: 3 }],
      models: [],
      benchmarkCandidates: [
        {
          ...safeCandidate,
        },
        {
          ...safeCandidate,
          id: "deprecated-model",
          name: "Deprecated Model",
          deprecated: true,
          benchmarks: riskyBenchmarks,
        },
        {
          ...safeCandidate,
          id: "retired-model",
          name: "Retired Model",
          benchmarks: riskyBenchmarks,
        },
      ],
    };

    expect(recommendModel(catalog, { useCase: "customer-support" })?.id).toBe(
      "safe-model",
    );
  });

  it("excludes retired benchmark candidates for every use case", () => {
    const commonCandidate = {
      provider: "google",
      name: "Safe Gemini",
      source: "artificialanalysis",
      pricing: {},
      recommendable: true,
      family: null,
      contextWindow: null,
      outputLimit: null,
      capabilities: null,
      modalities: null,
      openWeights: null,
      tier: null,
      deprecated: null,
      updatedAt: null,
    } satisfies Omit<BenchmarkCandidate, "id" | "benchmarks">;
    const autoClose = {
      source: "itsolver-autoclose",
      modelKey: "google:safe",
      apiModel: "safe",
      displayName: "Safe Gemini",
      benchmarkReport: "safe.md",
      resultsFile: "safe.json",
      generatedAt: "2026-05-22T00:00:00Z",
      benchmarkCodeSha: "test",
      total: 100,
      correctCount: 90,
      accuracy: 0.9,
      falsePositiveCount: 1,
      falseNegativeCount: 9,
      invalidCount: 0,
      errorCount: 0,
      parseSuccessRate: 1,
      avgLatencyMs: 1000,
      p95LatencyMs: 1200,
      avgInputTokens: 1000,
      avgOutputTokens: 100,
      weightedScore: 55,
      sourceUrl: "https://example.test/safe",
      verifiedOn: "2026-05-22",
      availability: {
        status: "production",
        acceptedRisk: false,
        reason: "test",
      },
    } as const;
    const candidates: BenchmarkCandidate[] = [
      {
        ...commonCandidate,
        id: "customer-safe",
        pricing: { inputPerMTok: 1, outputPerMTok: 1 },
        benchmarks: {
          llm: {
            instructionFollowing: 80,
            intelligenceRunTotalCost: 100,
            autoClose,
          },
        },
      },
      {
        ...commonCandidate,
        id: "google-gemini-2-0-flash-lite",
        name: "Gemini 2.0 Flash Lite",
        pricing: { inputPerMTok: 1, outputPerMTok: 1 },
        benchmarks: {
          llm: {
            instructionFollowing: 100,
            intelligenceRunTotalCost: 1,
            autoClose,
          },
        },
      },
      {
        ...commonCandidate,
        id: "voice-safe",
        pricing: { benchmarkInputAudioPerHour: 1, audioOutputPerHour: 1 },
        benchmarks: {
          voice: {
            speechReasoning: 0.8,
            agenticPerformance: 0.8,
            timeToFirstAudioSeconds: 1,
            source: "artificialanalysis",
            extractedAt: "2026-05-22T00:00:00Z",
          },
        },
      },
      {
        ...commonCandidate,
        id: "google-gemini-2-0-flash",
        name: "Gemini 2.0 Flash",
        pricing: { benchmarkInputAudioPerHour: 1, audioOutputPerHour: 1 },
        benchmarks: {
          voice: {
            speechReasoning: 1,
            agenticPerformance: 1,
            timeToFirstAudioSeconds: 0.1,
            source: "artificialanalysis",
            extractedAt: "2026-05-22T00:00:00Z",
          },
        },
      },
      {
        ...commonCandidate,
        id: "stt-safe",
        pricing: { transcriptionCostPer1kMinutes: 1 },
        benchmarks: {
          speechToText: {
            aaWer: 4,
            source: "artificialanalysis",
            extractedAt: "2026-05-22T00:00:00Z",
          },
        },
      },
      {
        ...commonCandidate,
        id: "google-gemini-2-0-flash-lite-stt",
        name: "Gemini 2.0 Flash Lite",
        pricing: { transcriptionCostPer1kMinutes: 0.1 },
        benchmarks: {
          speechToText: {
            aaWer: 3,
            source: "artificialanalysis",
            extractedAt: "2026-05-22T00:00:00Z",
          },
        },
      },
    ];
    const catalog: Catalog = {
      generatedAt: "2026-05-22T00:00:00Z",
      modelCount: candidates.length,
      activeModelCount: candidates.length,
      providers: [
        {
          provider: "google",
          total: candidates.length,
          active: candidates.length,
        },
      ],
      models: [],
      benchmarkCandidates: candidates,
    };

    expect(
      benchmarkCandidates(catalog, { useCase: "customer-support" }).map(
        (candidate) => candidate.id,
      ),
    ).toEqual(["customer-safe"]);
    expect(
      benchmarkCandidates(catalog, { useCase: "voice" }).map(
        (candidate) => candidate.id,
      ),
    ).toEqual(["voice-safe"]);
    expect(
      benchmarkCandidates(catalog, { useCase: "speech-to-text" }).map(
        (candidate) => candidate.id,
      ),
    ).toEqual(["stt-safe"]);
    expect(recommendModel(catalog, { useCase: "customer-support" })?.id).toBe(
      "customer-safe",
    );
    expect(recommendModel(catalog, { useCase: "voice" })?.id).toBe(
      "voice-safe",
    );
    expect(recommendModel(catalog, { useCase: "speech-to-text" })?.id).toBe(
      "stt-safe",
    );
  });

  it("keeps plain recommendations without a use case empty in AA-only mode", () => {
    const catalog = normalizeArtificialAnalysisCatalog(
      "2026-05-19T00:00:00Z",
      undefined,
      artificialAnalysisFixture.data,
    );

    expect(recommendModel(catalog, { provider: "xai" })).toBeUndefined();
  });

  it("uses Artificial Analysis speech-to-speech data for voice recommendations", () => {
    const catalog = normalizeArtificialAnalysisCatalog("2026-05-19T00:00:00Z");
    const recommendation = recommendModel(catalog, {
      provider: "xai",
      useCase: "voice",
    });

    expect(recommendation).toMatchObject({
      provider: "xai",
      source: "artificialanalysis",
      benchmarks: {
        voice: {
          source: "artificialanalysis",
        },
      },
    });
    expect(recommendation?.pricing.benchmarkInputAudioPerHour).toBeGreaterThan(
      0,
    );
  });

  it("uses voice recommendation priorities for cost, quality, and balance", () => {
    const candidate = (
      id: string,
      agenticPerformance: number,
      speechReasoning: number,
      telecomAgenticPerformance: number,
      timeToFirstAudioSeconds: number,
      inputCost: number,
      outputCost: number,
    ): BenchmarkCandidate => ({
      id,
      provider: "xai",
      name: id,
      source: "artificialanalysis",
      benchmarks: {
        voice: {
          source: "artificialanalysis",
          extractedAt: "2026-05-22T00:00:00Z",
          agenticPerformance,
          speechReasoning,
          telecomAgenticPerformance,
          timeToFirstAudioSeconds,
        },
      },
      pricing: {
        benchmarkInputAudioPerHour: inputCost,
        audioOutputPerHour: outputCost,
      },
      recommendable: true,
      family: null,
      contextWindow: null,
      outputLimit: null,
      capabilities: null,
      modalities: null,
      openWeights: null,
      tier: null,
      deprecated: null,
      updatedAt: null,
    });
    const catalog: Catalog = {
      generatedAt: "2026-05-22T00:00:00Z",
      modelCount: 5,
      activeModelCount: 5,
      providers: [{ provider: "xai", total: 5, active: 5 }],
      models: [],
      benchmarkCandidates: [
        candidate("highest-quality", 0.99, 0.8, 0.8, 2.5, 8, 8),
        candidate("quality-2", 0.9, 0.8, 0.8, 2, 7, 7),
        candidate("middle-quality", 0.8, 0.8, 0.8, 1.5, 6, 6),
        candidate("quality-4", 0.7, 0.8, 0.8, 1, 5, 5),
        candidate("cheapest", 0.6, 0.8, 0.8, 0.5, 1, 1),
      ],
    };

    expect(recommendModel(catalog, { useCase: "voice" })?.id).toBe("cheapest");
    expect(
      recommendModel(catalog, { useCase: "voice", tier: "balanced" })?.id,
    ).toBe("middle-quality");
    expect(
      recommendModel(catalog, { useCase: "voice", tier: "fast" })?.id,
    ).toBe("cheapest");
    expect(
      recommendModel(catalog, { useCase: "voice", tier: "best" })?.id,
    ).toBe("highest-quality");
    expect(
      recommendModel(catalog, {
        useCase: "voice",
        tier: "fast",
        maxAudioInputCostPerHour: 2,
      })?.id,
    ).toBe("cheapest");
  });

  it("uses Artificial Analysis speech-to-text data for STT recommendations", () => {
    const catalog = normalizeArtificialAnalysisCatalog(
      "2026-06-01T00:00:00Z",
      {
        base: "USD",
        quote: "AUD",
        rate: 2,
        source: "test",
      },
      [],
      artificialAnalysisSpeechToTextFixture.data,
    );
    const rows = benchmarkCandidates(catalog, { useCase: "speech-to-text" });
    const nvidia = rows.find(
      (row) => row.id === "nvidia-parakeet-tdt-0-6b-v3-togetherai",
    );
    const elevenlabs = rows.find((row) => row.provider === "elevenlabs");
    const groq = rows.find((row) => row.provider === "groq");
    const rawGeminiLite = catalog.benchmarkCandidates?.find(
      (row) => row.id === "google-gemini-2-0-flash-lite",
    );

    expect(catalog.providers.map((provider) => provider.provider)).toEqual(
      expect.arrayContaining(["openai", "nvidia", "elevenlabs", "groq"]),
    );
    expect(rows.map((row) => row.id)).not.toContain("deepgram-unsupported-stt");
    expect(rows.map((row) => row.id)).not.toContain(
      "google-gemini-2-0-flash-lite",
    );
    const noSlugIds = benchmarkCandidates(
      normalizeArtificialAnalysisCatalog(
        "2026-06-01T00:00:00Z",
        undefined,
        [],
        [
          {
            ...artificialAnalysisSpeechToTextFixture.data[0],
            name: "GPT-4o Mini Transcribe, OpenAI",
            slug: undefined,
          },
        ],
      ),
      { useCase: "speech-to-text" },
    ).map((row) => row.id);
    expect(noSlugIds).toContain("openai-gpt-4o-mini-transcribe");
    expect(noSlugIds).not.toContain("openai-gpt-4o-mini-transcribe-openai");
    expect(rawGeminiLite).toMatchObject({
      deprecated: true,
      recommendable: false,
    });
    const staleCachedCatalog: Catalog = {
      ...catalog,
      benchmarkCandidates: catalog.benchmarkCandidates?.map((row) =>
        row.id === "google-gemini-2-0-flash-lite"
          ? { ...row, deprecated: null, recommendable: true }
          : row,
      ),
    };
    expect(
      benchmarkCandidates(staleCachedCatalog, {
        useCase: "speech-to-text",
        maxAaWer: 4.6,
      }).map((row) => row.id),
    ).not.toContain("google-gemini-2-0-flash-lite");
    expect(nvidia).toMatchObject({
      id: "nvidia-parakeet-tdt-0-6b-v3-togetherai",
      provider: "nvidia",
      recommendable: true,
      pricing: {
        transcriptionCostPer1kMinutes: 3,
      },
      benchmarks: {
        speechToText: {
          aaWer: 4.5,
          speedFactor: 865.2,
          hostingProviderName: "Together.ai",
          hostingProviderSlug: "togetherai",
          source: "artificialanalysis",
          extractedAt: "2026-06-01T00:00:00Z",
        },
      },
    });
    expect(elevenlabs).toMatchObject({
      provider: "elevenlabs",
      recommendable: true,
      pricing: {
        transcriptionCostPer1kMinutes: 10,
      },
      benchmarks: {
        speechToText: {
          aaWer: 2.2,
        },
      },
    });
    expect(groq).toMatchObject({
      id: "groq-whisper-large-v3-turbo",
      provider: "groq",
      recommendable: true,
      pricing: {
        transcriptionCostPer1kMinutes: 1.34,
      },
      benchmarks: {
        speechToText: {
          aaWer: 4.6,
          hostingProviderName: "Groq",
          hostingProviderSlug: "groq",
        },
      },
    });
  });

  it("uses the checked-in speech-to-text table when beta API rows are absent", () => {
    const catalog = normalizeArtificialAnalysisCatalog("2026-06-01T00:00:00Z", {
      base: "USD",
      quote: "AUD",
      rate: 2,
      source: "test",
    });
    const nvidia = benchmarkCandidates(catalog, {
      useCase: "speech-to-text",
      provider: "nvidia",
    }).find((row) => row.id === "nvidia-parakeet-tdt-0-6b-v2");

    expect(
      recommendModel(catalog, { useCase: "speech-to-text", provider: "groq" }),
    ).toMatchObject({
      id: "groq-whisper-large-v3-turbo",
      pricing: {
        transcriptionCostPer1kMinutes: 1.34,
      },
      benchmarks: {
        speechToText: expect.objectContaining({
          aaWer: 4.6,
          speedFactor: 235.5,
          extractedAt: "2026-05-31T00:00:00.000Z",
        }),
      },
    });
    expect(nvidia).toMatchObject({
      recommendable: false,
      pricing: {
        transcriptionCostPer1kMinutes: 0,
      },
    });
  });

  it("rejects speech-to-text rows missing WER or pricing", () => {
    const catalog = normalizeArtificialAnalysisCatalog(
      "2026-06-01T00:00:00Z",
      undefined,
      [],
      artificialAnalysisSpeechToTextFixture.data,
    );
    const missingPrice = benchmarkCandidates(catalog, {}).find(
      (row) => row.id === "nvidia-canary-missing-price-replicate",
    );
    const missingWer = benchmarkCandidates(catalog, {}).find(
      (row) => row.id === "elevenlabs-scribe-missing-wer",
    );

    expect(missingPrice).toMatchObject({
      provider: "nvidia",
      recommendable: false,
    });
    expect(missingWer).toMatchObject({
      provider: "elevenlabs",
      recommendable: false,
    });
  });

  it("uses speech-to-text tier ordering and cost caps", () => {
    const catalog = normalizeArtificialAnalysisCatalog(
      "2026-06-01T00:00:00Z",
      {
        base: "USD",
        quote: "AUD",
        rate: 2,
        source: "test",
      },
      [],
      artificialAnalysisSpeechToTextFixture.data,
    );

    expect(
      recommendModel(catalog, { useCase: "speech-to-text" }),
    ).toMatchObject({
      id: "groq-whisper-large-v3-turbo",
      provider: "groq",
    });
    expect(
      recommendModel(catalog, { useCase: "speech-to-text", tier: "best" }),
    ).toMatchObject({
      id: "elevenlabs-scribe-v2",
      provider: "elevenlabs",
    });
    expect(
      recommendModel(catalog, { useCase: "speech-to-text", tier: "fast" }),
    ).toMatchObject({
      id: "groq-whisper-large-v3-turbo",
      provider: "groq",
    });
    expect(
      recommendModel(catalog, {
        useCase: "speech-to-text",
        maxTranscriptionCostPer1kMinutes: 4,
      }),
    ).toMatchObject({
      id: "groq-whisper-large-v3-turbo",
      provider: "groq",
    });
    expect(
      recommendModel(catalog, {
        useCase: "speech-to-text",
        provider: "nvidia",
        maxTranscriptionCostPer1kMinutes: 4,
      }),
    ).toMatchObject({
      id: "nvidia-parakeet-tdt-0-6b-v3-togetherai",
      provider: "nvidia",
    });
    expect(
      recommendModel(catalog, {
        useCase: "speech-to-text",
        provider: "groq",
        maxTranscriptionCostPer1kMinutes: 4,
      }),
    ).toMatchObject({
      id: "groq-whisper-large-v3-turbo",
      provider: "groq",
    });
    const cappedRows = benchmarkCandidates(catalog, {
      useCase: "speech-to-text",
      maxAaWer: 3,
    });
    expect(
      cappedRows.every(
        (row) =>
          (row.benchmarks.speechToText?.aaWer ?? Number.POSITIVE_INFINITY) <= 3,
      ),
    ).toBe(true);
    expect(cappedRows.map((row) => row.id)).not.toContain(
      "groq-whisper-large-v3-turbo",
    );
    expect(
      recommendModel(catalog, {
        useCase: "speech-to-text",
        provider: "groq",
        maxAaWer: 3,
      }),
    ).toBeUndefined();
  });

  it("applies cost caps before use-case scoring", () => {
    const catalog = normalizeArtificialAnalysisCatalog(
      "2026-05-19T00:00:00Z",
      undefined,
      artificialAnalysisFixture.data,
    );

    expect(
      recommendModel(catalog, {
        useCase: "customer-support",
        tier: "best",
        maxOutputCostPerMTok: 0.1,
      }),
    ).toBeUndefined();
    expect(
      recommendModel(catalog, {
        useCase: "customer-support",
        tier: "best",
        maxRunCostAud: 1,
      }),
    ).toBeUndefined();
    expect(
      benchmarkCandidates(catalog, {
        useCase: "customer-support",
        includeItsBenchmark: false,
        maxIntelligenceCostPerTaskAud: 0.5,
      }).every(
        (row) =>
          (row.benchmarks.llm?.intelligenceCostPerTask ??
            Number.POSITIVE_INFINITY) <= 0.5,
      ),
    ).toBe(true);
    expect(
      benchmarkCandidates(catalog, {
        useCase: "customer-support",
        minRunCostAud: 100,
        maxRunCostAud: 500,
      }).every(
        (row) =>
          (row.benchmarks.llm?.intelligenceRunTotalCost ??
            Number.NEGATIVE_INFINITY) >= 100 &&
          (row.benchmarks.llm?.intelligenceRunTotalCost ??
            Number.POSITIVE_INFINITY) <= 500,
      ),
    ).toBe(true);
  });

  it("converts USD run-cost caps with the catalog exchange rate", () => {
    const catalog = normalizeArtificialAnalysisCatalog("2026-05-19T00:00:00Z", {
      base: "USD",
      quote: "AUD",
      rate: 2,
      source: "test",
    });
    const rows = benchmarkCandidates(catalog, {
      useCase: "customer-support",
      includeItsBenchmark: false,
      maxRunCostUsd: 900,
    });
    const ids = rows.map((row) => row.id);

    expect(ids).toContain("gemini-3-1-pro-preview");
    expect(ids).toContain("grok-4-3");
    expect(ids).not.toContain("gemini-3-5-flash");
    expect(
      rows.every(
        (row) =>
          (row.benchmarks.llm?.intelligenceRunTotalCost ??
            Number.POSITIVE_INFINITY) <= 1800,
      ),
    ).toBe(true);
  });

  it("converts USD Intelligence Index task-cost caps with the catalog exchange rate", () => {
    const catalog = normalizeArtificialAnalysisCatalog("2026-05-19T00:00:00Z", {
      base: "USD",
      quote: "AUD",
      rate: 2,
      source: "test",
    });
    const rows = benchmarkCandidates(catalog, {
      useCase: "customer-support",
      includeItsBenchmark: false,
      maxIntelligenceCostPerTaskUsd: 1,
    });

    expect(rows.length).toBeGreaterThan(0);
    expect(
      rows.every(
        (row) =>
          (row.benchmarks.llm?.intelligenceCostPerTask ??
            Number.POSITIVE_INFINITY) <= 2,
      ),
    ).toBe(true);
  });

  it("supports the public AUD customer-support cap", () => {
    const catalog = normalizeArtificialAnalysisCatalog("2026-05-19T00:00:00Z", {
      base: "USD",
      quote: "AUD",
      rate: 1.4,
      source: "test",
    });
    const rows = benchmarkCandidates(catalog, {
      useCase: "customer-support",
      includeItsBenchmark: false,
      allowPreview: true,
      maxRunCostAud: 1300,
      minIntelligence: 30,
    });
    const ids = rows.map((row) => row.id);

    expect(ids).not.toContain("gpt-oss-20b-low");
    expect(ids).toContain("gemini-3-1-pro-preview");
    expect(ids).toContain("grok-4-3");
    expect(ids).not.toContain("gemini-3-5-flash");
    expect(
      rows.every(
        (row) =>
          (row.benchmarks.llm?.intelligence ?? Number.NEGATIVE_INFINITY) >=
            30 &&
          (row.benchmarks.llm?.intelligenceRunTotalCost ??
            Number.POSITIVE_INFINITY) <= 1300,
      ),
    ).toBe(true);
    expect(
      recommendModel(catalog, {
        provider: "google",
        useCase: "customer-support",
        tier: "best",
        includeItsBenchmark: false,
        allowPreview: true,
        maxRunCostAud: 1300,
        minIntelligence: 30,
      }),
    ).toBeUndefined();
    const xaiFast = recommendModel(catalog, {
      provider: "xai",
      useCase: "customer-support",
      tier: "fast",
      includeItsBenchmark: false,
      maxRunCostAud: 1300,
      minIntelligence: 30,
    });
    expect(xaiFast).toMatchObject({ provider: "xai" });
    expect(
      xaiFast?.benchmarks?.llm?.intelligenceRunTotalCost,
    ).toBeLessThanOrEqual(1300);
  });

  it("uses the visible AA support-score median for reported AA-only filters", () => {
    const catalog = normalizeArtificialAnalysisCatalog("2026-06-06T00:00:00Z", {
      base: "USD",
      quote: "AUD",
      rate: 1.4,
      source: "test",
    });
    const filters = {
      useCase: "customer-support" as const,
      tier: "balanced" as const,
      includeItsBenchmark: false,
      maxInputCostPerMTok: 35.45,
      maxRunCostAud: 1300,
      minIntelligence: 30,
    };
    const eligibleRows = benchmarkCandidates(catalog, filters).filter(
      (row) =>
        row.recommendable !== false &&
        row.capabilities?.vision === true &&
        row.capabilities.reasoning === true &&
        typeof row.pricing.inputPerMTok === "number" &&
        typeof row.pricing.outputPerMTok === "number" &&
        (row.availability === undefined ||
          row.availability.status === "production" ||
          row.availability.acceptedRisk),
    );

    expect(eligibleRows.length).toBeGreaterThan(2);
    expect(recommendModel(catalog, filters)?.id).toBe(
      aaSupportMedian(eligibleRows).id,
    );
  });

  it("applies capability filters to customer-support benchmark candidates", () => {
    const catalog = normalizeArtificialAnalysisCatalog("2026-05-19T00:00:00Z", {
      base: "USD",
      quote: "AUD",
      rate: 1.4,
      source: "test",
    });
    const reasoningRows = benchmarkCandidates(catalog, {
      useCase: "customer-support",
      capability: "reasoning",
      includeItsBenchmark: false,
      maxRunCostAud: 1300,
      minIntelligence: 30,
    });
    const pdfRows = benchmarkCandidates(catalog, {
      useCase: "customer-support",
      capability: "pdf",
      includeItsBenchmark: false,
      maxRunCostAud: 1300,
      minIntelligence: 30,
    });

    expect(reasoningRows.length).toBeGreaterThan(0);
    expect(
      reasoningRows.every((row) => row.capabilities?.reasoning === true),
    ).toBe(true);
    expect(pdfRows).toEqual([]);
  });

  it("excludes preview customer-support recommendations unless explicitly allowed", () => {
    const catalog = normalizeArtificialAnalysisCatalog("2026-05-19T00:00:00Z", {
      base: "USD",
      quote: "AUD",
      rate: 2,
      source: "test",
    });
    const preview = benchmarkCandidates(catalog, {
      provider: "google",
      useCase: "customer-support",
      includeItsBenchmark: false,
      maxRunCostUsd: 900,
    }).find((row) => row.id === "gemini-3-1-pro-preview");

    expect(preview).toMatchObject({
      availability: expect.objectContaining({
        status: "preview",
        acceptedRisk: false,
      }),
    });
    expect(
      recommendModel(catalog, {
        provider: "google",
        useCase: "customer-support",
        tier: "best",
        includeItsBenchmark: false,
        maxRunCostUsd: 900,
      }),
    ).toMatchObject({
      provider: "google",
      availability: expect.objectContaining({
        status: "production",
      }),
    });
    expect(
      recommendModel(catalog, {
        provider: "google",
        useCase: "customer-support",
        tier: "best",
        includeItsBenchmark: false,
        maxRunCostUsd: 900,
        allowPreview: true,
      }),
    ).toMatchObject({
      id: "gemini-2-5-pro",
      provider: "google",
      availability: expect.objectContaining({
        status: "production",
      }),
    });
  });

  it("attaches cached AA efficiency rows without requiring live API data", () => {
    const catalog = normalizeArtificialAnalysisCatalog("2026-05-19T00:00:00Z", {
      base: "USD",
      quote: "AUD",
      rate: 2,
      source: "test",
    });
    const sourceRecord = AA_LLM_EFFICIENCY_MODELS.find(
      (item) => item.slug === "gpt-5-5",
    );
    const row = benchmarkCandidates(catalog, {
      provider: "openai",
      useCase: "customer-support",
    }).find((item) => item.id === "gpt-5-5");

    expect(row?.benchmarks.llm?.intelligenceRunTotalCost).toBeCloseTo(
      (sourceRecord?.intelligenceRunTotalCost ?? 0) * 2,
    );
    expect(sourceRecord?.intelligenceCostPerTask).toEqual(expect.any(Number));
    expect(row?.benchmarks.llm?.intelligenceCostPerTask).toBeCloseTo(
      (sourceRecord?.intelligenceCostPerTask ?? 0) * 2,
    );
  });

  it("maps AA frontier support signals and pricing onto Anthropic rows", () => {
    const catalog = normalizeArtificialAnalysisCatalog("2026-05-19T00:00:00Z", {
      base: "USD",
      quote: "AUD",
      rate: 2,
      source: "test",
    });
    const sourceRecord = AA_LLM_EFFICIENCY_MODELS.find(
      (item) => item.slug === "claude-opus-4-7",
    );
    const row = benchmarkCandidates(catalog, {
      provider: "anthropic",
      useCase: "customer-support",
    }).find((item) => item.id === "claude-opus-4-7");

    expect(row).toMatchObject({
      provider: "anthropic",
      pricing: {
        inputPerMTok: (sourceRecord?.inputPrice ?? 0) * 2,
        outputPerMTok: (sourceRecord?.outputPrice ?? 0) * 2,
      },
      benchmarks: {
        llm: {
          intelligence: sourceRecord?.intelligenceIndex,
          agentic: sourceRecord?.agenticIndex,
          instructionFollowing: sourceRecord?.ifbench,
          tauTelecom: sourceRecord?.tau2,
          professional: sourceRecord?.gdpvalNormalized,
          terminalBench: sourceRecord?.terminalBenchHard,
          coding: sourceRecord?.codingIndex,
          lcr: sourceRecord?.lcr,
          gpqa: sourceRecord?.gpqa,
        },
      },
    });
    expect(row?.benchmarks.llm?.intelligenceRunTotalCost).toBeCloseTo(
      (sourceRecord?.intelligenceRunTotalCost ?? 0) * 2,
    );
    expect(row?.benchmarks.llm?.autoClose).toBeUndefined();
    expect(
      recommendModel(catalog, {
        provider: "anthropic",
        useCase: "customer-support",
      }),
    ).toBeUndefined();
    const recommendation = recommendModel(catalog, {
      provider: "anthropic",
      useCase: "customer-support",
      includeItsBenchmark: false,
    });
    expect(recommendation).toMatchObject({
      provider: "anthropic",
    });
    expect(recommendation?.pricing.outputPerMTok).toBeGreaterThan(0);
  });
});
