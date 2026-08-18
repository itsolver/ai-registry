import { describe, expect, it } from "vitest";
import { AA_SPEECH_TO_SPEECH_MODELS } from "../src/generated/aa-speech-to-speech";
import { AA_SPEECH_TO_TEXT_MODELS } from "../src/generated/aa-speech-to-text";
import { catalogSpeechSources } from "../src/refresh-speech-sources";
import {
  artificialAnalysisSpeechToSpeechApiFixture,
  artificialAnalysisSpeechToTextFixture,
} from "./fixtures";

describe("catalog refresh speech sources", () => {
  const voiceFallback = {
    models: [...AA_SPEECH_TO_SPEECH_MODELS],
    status: {
      state: "fallback_fresh" as const,
      origin: "kv_last_known_good" as const,
      fetchedAt: "2026-08-17T06:00:00.000Z",
      rowCount: AA_SPEECH_TO_SPEECH_MODELS.length,
    },
  };
  const freeSttRows = Array.from(
    {
      length: Math.ceil(AA_SPEECH_TO_TEXT_MODELS.length * 0.5),
    },
    (_, index) => ({
      id: `stt-free-${index}`,
      name: `Free STT ${index}`,
      model_creator: { id: "openai", name: "OpenAI" },
      aa_wer_index: 0.04 + index / 1000,
    }),
  );
  const freeS2sRows = Array.from(
    {
      length: Math.ceil(AA_SPEECH_TO_SPEECH_MODELS.length * 0.5),
    },
    (_, index) => ({
      id: `s2s-free-${index}`,
      name: `Free S2S ${index}`,
      slug: `free-s2s-${index}`,
      model_creator: { id: "openai", name: "OpenAI" },
      bba_score: 0.5,
      fdb_score: 0.4,
      tau_voice_score: 0.3,
    }),
  );

  it("keeps priced bundled speech data for Free API responses", () => {
    const result = catalogSpeechSources(
      {
        tier: "free",
        data: freeSttRows,
      },
      {
        tier: "free",
        data: freeS2sRows,
      },
      "2026-08-18T06:00:00.000Z",
      voiceFallback,
    );

    expect(result.speechToTextModels).toEqual([]);
    expect(result.speechToSpeechModels).toEqual(voiceFallback.models);
    expect(result.voiceStatus).toEqual(voiceFallback.status);
    expect(result.shouldPersistVoiceCapture).toBe(false);
  });

  it("uses and persists priced Pro speech responses", () => {
    const pricedSpeechToText = {
      ...artificialAnalysisSpeechToTextFixture,
      data: artificialAnalysisSpeechToTextFixture.data.filter((row) => {
        const modelWer =
          "aa_wer_index" in row && typeof row.aa_wer_index === "number";
        return row.providers.every(
          (provider) =>
            "price_per_1k_minutes" in provider &&
            typeof provider.price_per_1k_minutes === "number" &&
            provider.price_per_1k_minutes > 0 &&
            (modelWer ||
              ("aa_wer_index" in provider &&
                typeof provider.aa_wer_index === "number")),
        );
      }),
    };
    const result = catalogSpeechSources(
      pricedSpeechToText as unknown as Record<string, unknown>,
      artificialAnalysisSpeechToSpeechApiFixture as unknown as Record<
        string,
        unknown
      >,
      "2026-08-18T06:00:00.000Z",
      voiceFallback,
    );

    expect(result.speechToTextModels).toHaveLength(
      pricedSpeechToText.data.length,
    );
    expect(result.speechToSpeechModels.length).toBeGreaterThan(0);
    expect(result.voiceStatus).toMatchObject({
      state: "live",
      origin: "aa_api",
      fetchedAt: "2026-08-18T06:00:00.000Z",
    });
    expect(result.shouldPersistVoiceCapture).toBe(true);
  });

  it("rejects an empty Free speech response", () => {
    expect(() =>
      catalogSpeechSources(
        { tier: "free", data: [] },
        { tier: "free", data: [{}] },
        "2026-08-18T06:00:00.000Z",
        voiceFallback,
      ),
    ).toThrow("AA STT is empty or invalid");
  });

  it("rejects malformed or partial Free speech evidence", () => {
    expect(() =>
      catalogSpeechSources(
        { tier: "free", data: [{}] },
        { tier: "free", data: freeS2sRows },
        "2026-08-18T06:00:00.000Z",
        voiceFallback,
      ),
    ).toThrow("AA STT Free rows are invalid");

    expect(() =>
      catalogSpeechSources(
        { tier: "free", data: freeSttRows },
        { tier: "free", data: [freeS2sRows[0]] },
        "2026-08-18T06:00:00.000Z",
        voiceFallback,
      ),
    ).toThrow("AA S2S Free coverage is partial");
  });

  it("keeps bundled STT data for unknown or unpriced Pro responses", () => {
    const unpriced = {
      ...artificialAnalysisSpeechToTextFixture,
      data: artificialAnalysisSpeechToTextFixture.data.map((row) => ({
        ...row,
        providers: row.providers.map((provider) => ({
          ...provider,
          price_per_1k_minutes: null,
        })),
      })),
    };
    const result = catalogSpeechSources(
      unpriced as unknown as Record<string, unknown>,
      artificialAnalysisSpeechToSpeechApiFixture as unknown as Record<
        string,
        unknown
      >,
      "2026-08-18T06:00:00.000Z",
      voiceFallback,
    );
    expect(result.speechToTextModels).toEqual([]);

    expect(() =>
      catalogSpeechSources(
        { ...unpriced, tier: "unknown" },
        artificialAnalysisSpeechToSpeechApiFixture as unknown as Record<
          string,
          unknown
        >,
        "2026-08-18T06:00:00.000Z",
        voiceFallback,
      ),
    ).toThrow("AA STT has an unknown tier");
  });

  it("keeps bundled STT data when priced Pro rows lack WER evidence", () => {
    const missingWer = {
      tier: "pro",
      data: [
        {
          id: "stt-missing-wer",
          name: "Missing WER",
          model_creator: { name: "OpenAI", slug: "openai" },
          providers: [
            {
              id: "provider-openai",
              name: "OpenAI",
              slug: "openai",
              price_per_1k_minutes: 3,
            },
          ],
        },
      ],
    };
    const result = catalogSpeechSources(
      missingWer,
      artificialAnalysisSpeechToSpeechApiFixture as unknown as Record<
        string,
        unknown
      >,
      "2026-08-18T06:00:00.000Z",
      voiceFallback,
    );
    expect(result.speechToTextModels).toEqual([]);
  });

  it("rejects negative WER evidence", () => {
    expect(() =>
      catalogSpeechSources(
        {
          tier: "free",
          data: freeSttRows.map((row, index) =>
            index === 0 ? { ...row, aa_wer_index: -1 } : row,
          ),
        },
        { tier: "free", data: freeS2sRows },
        "2026-08-18T06:00:00.000Z",
        voiceFallback,
      ),
    ).toThrow("AA STT Free rows are invalid");

    const result = catalogSpeechSources(
      {
        tier: "pro",
        data: [
          {
            id: "stt-negative-wer",
            name: "Negative WER",
            aa_wer_index: -1,
            model_creator: { name: "OpenAI", slug: "openai" },
            providers: [
              {
                id: "provider-openai",
                name: "OpenAI",
                slug: "openai",
                price_per_1k_minutes: 3,
              },
            ],
          },
        ],
      },
      artificialAnalysisSpeechToSpeechApiFixture as unknown as Record<
        string,
        unknown
      >,
      "2026-08-18T06:00:00.000Z",
      voiceFallback,
    );
    expect(result.speechToTextModels).toEqual([]);
  });
});
