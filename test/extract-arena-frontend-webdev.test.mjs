import { describe, expect, it } from "vitest";
import {
  MODEL_MAPPINGS,
  extractArenaFrontendWebDev,
  validateRegistryMappings,
} from "../scripts/extract-arena-frontend-webdev.mjs";

const ORGANIZATIONS = {
  anthropic: "Anthropic",
  google: "Google",
  moonshotai: "Moonshot AI",
  openai: "OpenAI",
  xai: "SpaceXAI",
};

function arenaHtml(transform = (rows) => rows) {
  const rows = [...MODEL_MAPPINGS.entries()].map(
    ([label, model], index) => rowHtml({
      rank: index + 1,
      label,
      organization: ORGANIZATIONS[model.provider],
      preliminary: index === 0,
    }),
  );
  rows.push(
    rowHtml({ rank: 16, label: "unsupported-model", organization: "Other AI" }),
  );
  return `<main>Aug 15, 2026 579,848 votes 115 models<table><tbody>${transform(rows).join("")}</tbody></table></main>`;
}

function rowHtml({
  rank,
  label,
  organization,
  preliminary = false,
  prices = "$1 / $5",
}) {
  return `<tr>
    <td>${rank}</td>
    <td>${rank} ${rank + 1}</td>
    <td><title>${organization}</title><a href="https://example.com/${rank}"><span title="${label}">${label}</span></a>${organization} · Proprietary</td>
    <td>${1700 - rank} +9/-9 ${preliminary ? "Preliminary" : ""}</td>
    <td>${(1000 + rank).toLocaleString("en-US")}</td>
    <td>${prices}</td>
    <td>1M</td>
  </tr>`;
}

describe("Arena front-end extractor", () => {
  it("extracts mapped supported rows and ignores unsupported providers", () => {
    const snapshot = extractArenaFrontendWebDev(arenaHtml());

    expect(snapshot).toMatchObject({
      updatedOn: "2026-08-15",
      voteCutoffAt: "2026-08-15T00:00:00Z",
      totalVotes: 579_848,
      modelCount: 115,
    });
    expect(snapshot.models).toHaveLength(MODEL_MAPPINGS.size);
    expect(snapshot.models[0]).toMatchObject({
      id: "claude-opus-5-max",
      provider: "anthropic",
      registryModelId: "claude-opus-5",
      rank: 1,
      rankLow: 1,
      rankHigh: 2,
      score: 1699,
      confidence: 9,
      votes: 1001,
      preliminary: true,
      inputPriceUsd: 1,
      outputPriceUsd: 5,
      contextWindow: 1_000_000,
      configuration: { displayLabel: "max" },
    });
  });

  it("fails when a supported row has no explicit mapping", () => {
    expect(() =>
      extractArenaFrontendWebDev(
        arenaHtml((rows) => [
          rows[0].replaceAll("claude-opus-5-max", "claude-new-unmapped-high"),
          ...rows.slice(1),
        ]),
      ),
    ).toThrow("Missing registry mapping for supported Arena row");
  });

  it("fails on malformed metrics and duplicate rows", () => {
    expect(() =>
      extractArenaFrontendWebDev(
        arenaHtml((rows) => [rows[0].replace("$1 / $5", "N/A"), ...rows.slice(1)]),
      ),
    ).toThrow("Incomplete Arena metrics");
    expect(() =>
      extractArenaFrontendWebDev(arenaHtml((rows) => [rows[0], rows[0], ...rows.slice(1)])),
    ).toThrow("Duplicate Arena row");
  });

  it("validates every canonical models.dev target", () => {
    const snapshot = extractArenaFrontendWebDev(arenaHtml());
    const modelsDev = {};
    for (const model of snapshot.models) {
      modelsDev[model.provider] ??= { models: {} };
      modelsDev[model.provider].models[model.registryModelId] = {
        id: model.registryModelId,
      };
    }
    expect(() => validateRegistryMappings(snapshot.models, modelsDev)).not.toThrow();

    delete modelsDev.anthropic.models["claude-opus-5"];
    expect(() => validateRegistryMappings(snapshot.models, modelsDev)).toThrow(
      "models.dev mapping target is unavailable: anthropic:claude-opus-5",
    );
  });
});
