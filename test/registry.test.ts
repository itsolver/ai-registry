import { describe, expect, it } from "vitest";
import {
  benchmarkCandidates,
  normalizeArtificialAnalysisCatalog,
  parseFilters,
  recommendModel,
  type Catalog,
} from "../src/registry";
import { AA_LLM_EFFICIENCY_MODELS } from "../src/generated/aa-llm-efficiency";
import {
  artificialAnalysisFixture,
  artificialAnalysisSpeechToTextFixture,
} from "./fixtures";

describe("filter parsing", () => {
  it("parses supported filters and legacy use-case aliases", () => {
    const filters = parseFilters(
      new URLSearchParams(
        "useCase=customer-support&minCostPerMTok=1&maxCostPerMTok=2&minOutputCostPerMTok=4&maxOutputCostPerMTok=8&minRunCostAud=100&maxRunCostAud=500&maxContextWindow=1000000",
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
      maxContextWindow: 1000000,
      includeItsBenchmark: true,
    });
    expect(
      parseFilters(new URLSearchParams("includeItsBenchmark=false"))
        .includeItsBenchmark,
    ).toBe(false);
    expect(parseFilters(new URLSearchParams("useCase=support")).useCase).toBe(
      "customer-support",
    );
    expect(parseFilters(new URLSearchParams("useCase=billing-incident"))).toMatchObject({
      useCase: "customer-support",
    });
    expect(parseFilters(new URLSearchParams("useCase=stt"))).toMatchObject({
      useCase: "speech-to-text",
    });
    expect(
      parseFilters(
        new URLSearchParams("provider=groq&maxTranscriptionCostPer1kMinutes=5"),
      ),
    ).toMatchObject({
      provider: "groq",
      maxTranscriptionCostPer1kMinutes: 5,
    });
    expect(parseFilters(new URLSearchParams("provider=deepgram"))).toMatchObject({
      unsupportedProvider: true,
    });
  });
});

describe("Artificial Analysis catalog", () => {
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
    expect(ids).not.toContain("grok-4.20-0309-non-reasoning");
    expect(ids).not.toContain("grok-4.20-multi-agent-0309");
    expect(ids).not.toContain("gemini-2.0-flash-lite");
    expect(ids).not.toContain("unsupported-model");
    const geminiLite = benchmarkCandidates(catalog, {}).find(
      (row) => row.id === "gemini-2.0-flash-lite",
    );
    expect(geminiLite).toMatchObject({
      provider: "google",
      recommendable: false,
      contextWindow: null,
    });
    expect(geminiLite?.registryModelId).toBeUndefined();
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

  it("uses auto-close false positives before cost for customer support rankings", () => {
    const catalog = normalizeArtificialAnalysisCatalog(
      "2026-05-19T00:00:00Z",
      undefined,
      artificialAnalysisFixture.data,
    );
    const openaiRecommendation = recommendModel(catalog, {
      provider: "openai",
      useCase: "customer-support",
    });
    const gpt54Low = benchmarkCandidates(catalog, {
      provider: "openai",
      useCase: "customer-support",
    }).find((row) => row.id === "gpt-5-4-low");
    const googlePreviewRecommendation = recommendModel(catalog, {
      provider: "google",
      useCase: "customer-support",
    });
    const googlePreview = benchmarkCandidates(catalog, {
      provider: "google",
      useCase: "customer-support",
    }).find((row) => row.id === "gemini-3-flash-reasoning");

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

    expect(recommendModel(catalog, { useCase: "customer-support" })?.id).toBe(
      balancedRecommendation?.id,
    );
    expect(
      fastRecommendation?.benchmarks?.llm?.intelligenceRunTotalCost ??
        Number.POSITIVE_INFINITY,
    ).toBeLessThanOrEqual(
      bestRecommendation?.benchmarks?.llm?.intelligenceRunTotalCost ??
        Number.POSITIVE_INFINITY,
    );
    expect(bestRecommendation?.benchmarks?.llm?.intelligence ?? 0).toBeGreaterThanOrEqual(
      fastRecommendation?.benchmarks?.llm?.intelligence ?? 0,
    );
    expect(openaiRecommendation).toMatchObject({
      id: "gpt-5-4-low",
      provider: "openai",
      recommendable: true,
      pricing: {
        inputPerMTok: 2.5,
        outputPerMTok: 15,
      },
      benchmarks: {
        llm: {
          autoClose: expect.objectContaining({
            falsePositiveCount: 6,
            accuracy: expect.any(Number),
            sourceUrl: expect.any(String),
            verifiedOn: "2026-05-21",
          }),
        },
      },
    });
    expect(gpt54Low).toMatchObject({
      contextWindow: 1050000,
      benchmarks: {
        llm: {
          customerSupportRank: 6,
          instructionFollowing: expect.any(Number),
          agentic: expect.any(Number),
          autoClose: expect.objectContaining({
            falsePositiveCount: 6,
            benchmarkReport: "AI_AUTOCLOSE_CODEX_GPT_5_4_LOW.md",
          }),
        },
      },
    });
    expect(googlePreviewRecommendation).toBeUndefined();
    expect(googlePreview).toMatchObject({
      recommendable: false,
      benchmarks: {
        llm: {
          autoClose: expect.objectContaining({
            availability: expect.objectContaining({
              status: "preview",
              acceptedRisk: false,
            }),
          }),
        },
      },
    });
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
    const recommendation = recommendModel(catalog, { provider: "xai", useCase: "voice" });

    expect(recommendation).toMatchObject({
      provider: "xai",
      source: "artificialanalysis",
      benchmarks: {
        voice: {
          source: "artificialanalysis",
        },
      },
    });
    expect(recommendation?.pricing.benchmarkInputAudioPerHour).toBeGreaterThan(0);
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

    expect(catalog.providers.map((provider) => provider.provider)).toEqual(
      expect.arrayContaining(["openai", "nvidia", "elevenlabs", "groq"]),
    );
    expect(rows.map((row) => row.id)).not.toContain("deepgram-unsupported-stt");
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
    const catalog = normalizeArtificialAnalysisCatalog(
      "2026-06-01T00:00:00Z",
      {
        base: "USD",
        quote: "AUD",
        rate: 2,
        source: "test",
      },
    );
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

    expect(recommendModel(catalog, { useCase: "speech-to-text" })).toMatchObject({
      id: "elevenlabs-scribe-v2",
      provider: "elevenlabs",
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
      id: "nvidia-parakeet-tdt-0-6b-v3-togetherai",
      provider: "nvidia",
    });
    expect(
      recommendModel(catalog, {
        useCase: "speech-to-text",
        maxTranscriptionCostPer1kMinutes: 4,
      }),
    ).toMatchObject({
      id: "google-gemini-2-0-flash-lite",
      provider: "google",
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
        maxOutputCostPerMTok: 1,
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
        minRunCostAud: 100,
        maxRunCostAud: 500,
      }).every(
        (row) =>
          (row.benchmarks.llm?.intelligenceRunTotalCost ?? Number.NEGATIVE_INFINITY) >=
            100 &&
          (row.benchmarks.llm?.intelligenceRunTotalCost ?? Number.POSITIVE_INFINITY) <=
          500,
      ),
    ).toBe(true);
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

    expect(row?.benchmarks.llm?.intelligenceRunOutputTokens).toBe(
      sourceRecord?.intelligenceRunOutputTokens,
    );
    expect(row?.benchmarks.llm?.intelligenceRunTotalCost).toBeCloseTo(
      (sourceRecord?.intelligenceRunTotalCost ?? 0) * 2,
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
          intelligenceRunOutputTokens: sourceRecord?.intelligenceRunOutputTokens,
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
    expect(
      recommendModel(catalog, {
        provider: "anthropic",
        useCase: "customer-support",
        includeItsBenchmark: false,
      }),
    ).toMatchObject({
      id: "claude-opus-4-7-non-reasoning",
      provider: "anthropic",
    });
  });
});
