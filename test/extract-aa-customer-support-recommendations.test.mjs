import { describe, expect, it } from "vitest";
import { extractRecommendationRecords } from "../scripts/extract-aa-customer-support-recommendations.mjs";

function flightHtml(models) {
  const payload = JSON.stringify(["", JSON.stringify({ models })]);
  return `<html><body><script>self.__next_f.push(${payload})</script></body></html>`;
}

describe("AA customer support recommendation extraction", () => {
  it("uses source model order instead of a fixed slug list", () => {
    const records = extractRecommendationRecords(
      flightHtml([
        {
          name: "Future Gemini",
          url: "/models/gemini-future",
          creator: { name: "Google" },
          intelligenceIndex: 61,
          intelligenceIndexCost: 450,
          inputPrice: 1,
          outputPrice: 2,
          imageInput: true,
          reasoning: true,
        },
        {
          name: "Unsupported",
          url: "/models/other-model",
          creator: { name: "Other" },
          intelligenceIndexCost: 10,
          inputPrice: 1,
          outputPrice: 1,
        },
        {
          name: "No Vision",
          url: "/models/no-vision",
          creator: { name: "OpenAI" },
          intelligenceIndexCost: 5,
          inputPrice: 0.1,
          outputPrice: 0.2,
          imageInput: false,
          reasoning: true,
        },
        {
          name: "No Reasoning",
          url: "/models/no-reasoning",
          creator: { name: "OpenAI" },
          intelligenceIndexCost: 6,
          inputPrice: 0.1,
          outputPrice: 0.2,
          imageInput: true,
          reasoning: false,
        },
        {
          name: "Future Grok",
          url: "/models/grok-future",
          creator: { name: "xAI" },
          intelligenceIndex: 58,
          intelligenceIndexCost: 350,
          inputPrice: 1.25,
          outputPrice: 2.5,
          imageInput: true,
          reasoning: true,
        },
      ]),
    );

    expect(records).toEqual([
      expect.objectContaining({
        rank: 1,
        slug: "gemini-future",
        provider: "google",
      }),
      expect.objectContaining({
        rank: 2,
        slug: "grok-future",
        provider: "xai",
      }),
    ]);
  });
});
