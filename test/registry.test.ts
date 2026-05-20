import { describe, expect, it } from "vitest";
import {
  filterModels,
  isRecommendationCandidate,
  latestForProvider,
  normalizeModelsDev,
  parseFilters,
  recommendModel,
} from "../src/registry";
import { artificialAnalysisFixture, modelsDevFixture } from "./fixtures";

describe("models.dev normalization", () => {
  it("imports only the configured private provider set", () => {
    const catalog = normalizeModelsDev(modelsDevFixture, "2026-05-19T00:00:00Z");

    expect(catalog.providers.map((provider) => provider.provider)).toEqual([
      "openai",
      "google",
      "xai",
      "anthropic",
    ]);
    expect(catalog.models.map((model) => model.provider as string)).not.toContain(
      "cohere",
    );
  });

  it("maps models.dev fields into the public API schema", () => {
    const catalog = normalizeModelsDev(modelsDevFixture, "2026-05-19T00:00:00Z", {
      base: "USD",
      quote: "AUD",
      rate: 1.5,
      date: "2026-05-19",
      source: "test",
    });
    const model = catalog.models.find((item) => item.id === "gemini-fast");

    expect(catalog.exchangeRate).toMatchObject({
      base: "USD",
      quote: "AUD",
      rate: 1.5,
    });
    expect(model).toMatchObject({
      provider: "google",
      contextWindow: 1000000,
      outputLimit: 64000,
      pricing: {
        inputPerMTok: 0.75,
        outputPerMTok: 4.5,
      },
      capabilities: {
        vision: true,
        pdf: true,
        reasoning: true,
        toolCalling: true,
        structuredOutput: true,
      },
      openWeights: false,
      deprecated: false,
    });
  });

  it("derives cost-first tiers per provider", () => {
    const catalog = normalizeModelsDev(modelsDevFixture, "2026-05-19T00:00:00Z");

    expect(catalog.models.find((model) => model.id === "gpt-cheap")?.tier).toBe(
      "fast",
    );
    expect(catalog.models.find((model) => model.id === "gpt-middle")?.tier).toBe(
      "balanced",
    );
    expect(
      catalog.models.find((model) => model.id === "gpt-expensive")?.tier,
    ).toBe("best");
  });
});

describe("filtering and recommendations", () => {
  it("filters by provider, capability, cost, and context", () => {
    const catalog = normalizeModelsDev(modelsDevFixture, "2026-05-19T00:00:00Z");
    const models = filterModels(catalog.models, {
      provider: "openai",
      capability: "reasoning",
      maxInputCostPerMTok: 3,
      minContextWindow: 300000,
    });

    expect(models.map((model) => model.id)).toEqual(["gpt-middle"]);
  });

  it("filters by output token cost separately from input token cost", () => {
    const catalog = normalizeModelsDev(modelsDevFixture, "2026-05-19T00:00:00Z");
    const models = filterModels(catalog.models, {
      provider: "openai",
      capability: "reasoning",
      maxInputCostPerMTok: 20,
      maxOutputCostPerMTok: 10,
      includeDeprecated: true,
    });

    expect(models.map((model) => model.id)).toEqual(["gpt-middle"]);
  });

  it("parses customer support use case and keeps legacy input cost alias", () => {
    const filters = parseFilters(
      new URLSearchParams(
        "useCase=customer-support&maxCostPerMTok=2&maxOutputCostPerMTok=8",
      ),
    );

    expect(filters).toMatchObject({
      useCase: "customer-support",
      maxInputCostPerMTok: 2,
      maxOutputCostPerMTok: 8,
    });
    expect(parseFilters(new URLSearchParams("useCase=support")).useCase).toBe(
      "customer-support",
    );
    expect(parseFilters(new URLSearchParams("useCase=billing")).useCase).toBe(
      undefined,
    );
  });

  it("does not treat unsupported providers as any provider", () => {
    const catalog = normalizeModelsDev(modelsDevFixture, "2026-05-19T00:00:00Z");
    const filters = parseFilters(new URLSearchParams("provider=nvidia"));

    expect(filters).toMatchObject({ unsupportedProvider: true });
    expect(filterModels(catalog.models, { provider: "openai" })).not.toEqual([]);
    expect(filterModels(catalog.models, filters)).toEqual([]);
  });

  it("excludes deprecated models by default", () => {
    const catalog = normalizeModelsDev(modelsDevFixture, "2026-05-19T00:00:00Z");

    expect(filterModels(catalog.models, {}).some((model) => model.deprecated)).toBe(
      false,
    );
    expect(
      filterModels(catalog.models, { includeDeprecated: true }).some(
        (model) => model.id === "claude-old",
      ),
    ).toBe(true);
  });

  it("recommends within the requested tier after filters", () => {
    const catalog = normalizeModelsDev(modelsDevFixture, "2026-05-19T00:00:00Z");

    expect(
      recommendModel(catalog, { provider: "openai", tier: "fast" })?.id,
    ).toBe("gpt-cheap");
    expect(
      recommendModel(catalog, { provider: "openai", tier: "best" })?.id,
    ).toBe("gpt-expensive");
  });

  it("uses benchmark-aware scoring for coding recommendations", () => {
    const catalog = normalizeModelsDev(
      modelsDevFixture,
      "2026-05-19T00:00:00Z",
      undefined,
      artificialAnalysisFixture.data,
    );

    expect(
      recommendModel(catalog, {
        provider: "openai",
        useCase: "coding",
        careLevel: "premium",
      })?.id,
    ).toBe("gpt-expensive");
    expect(
      catalog.models.find((model) => model.id === "gpt-expensive")?.benchmarks?.llm,
    ).toMatchObject({
      coding: 90,
      terminalBench: 86,
      instructionFollowing: 96,
    });
  });

  it("uses Artificial Analysis speech-to-speech data for voice recommendations", () => {
    const catalog = normalizeModelsDev(modelsDevFixture, "2026-05-19T00:00:00Z");
    const recommendation = recommendModel(catalog, { provider: "xai", useCase: "voice" });

    expect(recommendation).toMatchObject({
      provider: "xai",
      modalities: {
        input: ["audio"],
        output: ["audio"],
      },
      benchmarks: {
        voice: {
          source: "artificialanalysis",
        },
      },
    });
    expect(recommendation?.pricing.benchmarkInputAudioPerHour).toBeGreaterThan(0);
    expect(
      filterModels(catalog.models, { useCase: "voice" }).map((model) => model.id),
    ).not.toContain("google-gemini-2-5-flash-native-audio-dialog-thinking");
  });

  it("filters voice input cost by benchmark-run cost, not raw provider input price", () => {
    const catalog = normalizeModelsDev(modelsDevFixture, "2026-05-19T00:00:00Z");

    expect(
      recommendModel(catalog, {
        useCase: "voice",
        maxAudioInputCostPerHour: 1,
      }),
    ).toBeUndefined();
  });

  it("falls back to voice input price for voice output cost filters", () => {
    const catalog = normalizeModelsDev(modelsDevFixture, "2026-05-19T00:00:00Z");

    expect(
      recommendModel(catalog, {
        provider: "xai",
        useCase: "voice",
        maxAudioOutputCostPerHour: 3,
      })?.id,
    ).toBe("grok-voice-think-fast-1-0");
    expect(
      recommendModel(catalog, {
        provider: "xai",
        useCase: "voice",
        maxAudioOutputCostPerHour: 2,
      }),
    ).toBeUndefined();
  });

  it("does not recommend embedding models", () => {
    const catalog = normalizeModelsDev(modelsDevFixture, "2026-05-19T00:00:00Z");

    expect(recommendModel(catalog, { provider: "openai" })?.id).not.toContain(
      "embedding",
    );
  });

  it("does not recommend open-weight or zero-priced models", () => {
    const catalog = normalizeModelsDev(modelsDevFixture, "2026-05-19T00:00:00Z");
    const gemma = catalog.models.find((model) => model.id === "gemma-open");

    expect(gemma).toBeDefined();
    expect(isRecommendationCandidate(gemma!)).toBe(false);
    expect(
      recommendModel(catalog, {
        provider: "google",
        tier: "fast",
        capability: "reasoning",
      })?.id,
    ).toBe("gemini-fast");
  });

  it("returns the latest non-deprecated provider model", () => {
    const catalog = normalizeModelsDev(modelsDevFixture, "2026-05-19T00:00:00Z");

    expect(latestForProvider(catalog, "openai")?.id).toBe("text-embedding-3-large");
    expect(latestForProvider(catalog, "anthropic")?.id).toBe("claude-current");
  });
});
