import { describe, expect, it } from "vitest";
import {
  normalizeArtificialAnalysisSpeechToSpeechRecords,
  parseArtificialAnalysisSpeechToSpeechApi,
  parseArtificialAnalysisSpeechToSpeechPage,
} from "../src/aa-speech-to-speech";
import {
  artificialAnalysisSpeechToSpeechApiFixture,
  artificialAnalysisSpeechToSpeechPageFixture,
  artificialAnalysisSpeechToSpeechRecordFixture,
} from "./fixtures";

describe("Artificial Analysis speech-to-speech parsing", () => {
  it("parses complete escaped page objects after defaultSelected", () => {
    const rows = parseArtificialAnalysisSpeechToSpeechPage(
      artificialAnalysisSpeechToSpeechPageFixture,
    );

    expect(rows).toHaveLength(8);
    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
        slug: "gpt-realtime-2-high",
        provider: "openai",
        s2sQualityIndex: 77.216,
        averageCostPerTask: 0.0214,
        }),
      ]),
    );
  });

  it("rejects unrelated provider objects without speech-to-speech evidence", () => {
    const unrelated = {
      id: "provider-object",
      name: "Unrelated OpenAI object",
      slug: "unrelated-openai-object",
      host: { name: "OpenAI", slug: "openai" },
    };
    const html = `<script>self.__next_f.push([1,"${JSON.stringify(unrelated).replaceAll('"', '\\"')}"])</script>`;

    expect(parseArtificialAnalysisSpeechToSpeechPage(html)).toEqual([]);
  });

  it("parses API data and keeps the most complete exact slug", () => {
    const rows = parseArtificialAnalysisSpeechToSpeechApi({
      data: [
        { ...artificialAnalysisSpeechToSpeechRecordFixture, bbaScore: undefined },
        artificialAnalysisSpeechToSpeechRecordFixture,
      ],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].bbaScore).toBe(0.966);
    expect(
      parseArtificialAnalysisSpeechToSpeechApi(
        artificialAnalysisSpeechToSpeechApiFixture,
      ),
    ).toHaveLength(8);
  });

  it("expands the documented model-level API response into provider rows", () => {
    const rows = parseArtificialAnalysisSpeechToSpeechApi({
      tier: "pro",
      data: [
        {
          id: "model-id",
          name: "GPT-Realtime-2 (High)",
          slug: "gpt-realtime-2-high",
          model_creator: { id: "creator-id", name: "OpenAI" },
          bba_score: 0.966,
          tau_voice_score: 0.398,
          fdb_score: 0.953,
          providers: [
            {
              id: "provider-id",
              name: "OpenAI",
              slug: "openai",
              price_per_hour_input: 1.152,
              price_per_hour_output: 4.608,
              time_to_first_audio_seconds: 1.14,
            },
          ],
        },
      ],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "model-id:provider-id",
      slug: "gpt-realtime-2-high",
      provider: "openai",
      modelSlug: "gpt-realtime-2-high",
      bbaScore: 0.966,
      tauVoiceAggScore: 0.398,
      fdbScore: 0.953,
      pricePerHourInput: 1.152,
      pricePerHourOutput: 4.608,
      timeToFirstAudioSeconds: 1.14,
    });
    expect(rows[0].s2sQualityIndex).toBeCloseTo(77.233, 3);
  });

  it("drops malformed and unsupported provider rows", () => {
    expect(
      normalizeArtificialAnalysisSpeechToSpeechRecords([
        {},
        {
          ...artificialAnalysisSpeechToSpeechRecordFixture,
          host: { name: "Unsupported", slug: "unsupported" },
        },
      ]),
    ).toEqual([]);
  });
});
