import { describe, expect, it } from "vitest";
import { AA_SPEECH_TO_SPEECH_MODELS } from "../src/generated/aa-speech-to-speech";
import { catalogSpeechSources } from "../src/refresh-speech-sources";
import {
  artificialAnalysisSpeechToSpeechApiFixture,
  artificialAnalysisSpeechToTextFixture,
} from "./fixtures";

describe("catalog refresh speech sources", () => {
  it("keeps priced bundled speech data for Free API responses", () => {
    const result = catalogSpeechSources(
      {
        tier: "free",
        data: [
          {
            id: "stt-free",
            name: "Free STT",
            model_creator: { id: "openai", name: "OpenAI" },
            aa_wer_index: 0.04,
          },
        ],
      },
      {
        tier: "free",
        data: [
          {
            id: "s2s-free",
            name: "Free S2S",
            slug: "free-s2s",
            model_creator: { id: "openai", name: "OpenAI" },
            bba_score: 0.5,
            fdb_score: 0.4,
            tau_voice_score: 0.3,
          },
        ],
      },
      "2026-08-18T06:00:00.000Z",
    );

    expect(result.speechToTextModels).toEqual([]);
    expect(result.speechToSpeechModels).toEqual(AA_SPEECH_TO_SPEECH_MODELS);
    expect(result.voiceStatus.origin).toBe("bundled_snapshot");
    expect(result.shouldPersistVoiceCapture).toBe(false);
  });

  it("uses and persists priced Pro speech responses", () => {
    const result = catalogSpeechSources(
      artificialAnalysisSpeechToTextFixture as unknown as Record<string, unknown>,
      artificialAnalysisSpeechToSpeechApiFixture as unknown as Record<
        string,
        unknown
      >,
      "2026-08-18T06:00:00.000Z",
    );

    expect(result.speechToTextModels).toHaveLength(
      artificialAnalysisSpeechToTextFixture.data.length,
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
      ),
    ).toThrow("AA STT is empty or invalid");
  });
});
