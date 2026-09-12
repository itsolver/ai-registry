import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_URL = "https://arena.ai/leaderboard/code/webdev";
const MODELS_DEV_URL = "https://models.dev/api.json";
const OUT_PATH = resolve("src/generated/arena-frontend-webdev.ts");
const MAX_RANK = 20;
const MAX_AGE_DAYS = 30;

export const MODEL_MAPPINGS = new Map([
  ["claude-opus-5-max", mapping("anthropic", "claude-opus-5", "max")],
  ["kimi-k3-max", mapping("moonshotai", "kimi-k3", "max")],
  ["claude-opus-5-high", mapping("anthropic", "claude-opus-5", "high effort", "high")],
  ["grok-4.6-high", mapping("xai", "grok-4.6", "high effort", "high")],
  ["claude-fable-5", mapping("anthropic", "claude-fable-5")],
  [
    "gpt-5.6-sol-xhigh (codex-harness)",
    mapping("openai", "gpt-5.6-sol", "xhigh via Codex harness", "xhigh", "codex"),
  ],
  ["gemini-3.7-flash-high", mapping("google", "gemini-3.7-flash", "high effort", "high")],
  ["claude-opus-4-8-high", mapping("anthropic", "claude-opus-4-8", "high effort", "high")],
  ["claude-opus-4-7", mapping("anthropic", "claude-opus-4-7")],
  ["claude-opus-4-7-high", mapping("anthropic", "claude-opus-4-7", "high effort", "high")],
  ["grok-4.5", mapping("xai", "grok-4.5")],
  ["claude-opus-4-6-high", mapping("anthropic", "claude-opus-4-6", "high effort", "high")],
  ["claude-sonnet-5-high", mapping("anthropic", "claude-sonnet-5", "high effort", "high")],
  ["claude-opus-4-8", mapping("anthropic", "claude-opus-4-8")],
  ["claude-opus-4-6", mapping("anthropic", "claude-opus-4-6")],
]);

const SUPPORTED_ORGANIZATIONS = new Map([
  ["anthropic", "anthropic"],
  ["google", "google"],
  ["moonshot", "moonshotai"],
  ["moonshotai", "moonshotai"],
  ["openai", "openai"],
  ["spacexai", "xai"],
  ["xai", "xai"],
]);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}

async function main() {
  const html = process.argv[2]
    ? readFileSync(resolve(process.argv[2]), "utf8")
    : await fetchText(SOURCE_URL, "Arena");
  const snapshot = extractArenaFrontendWebDev(html);
  const modelsDev = await fetchJson(MODELS_DEV_URL, "models.dev");
  validateRegistryMappings(snapshot.models, modelsDev);

  const checkedAt = new Date().toISOString();
  const content = renderGeneratedModule({ ...snapshot, checkedAt });
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, content);
  console.log(
    `Wrote ${snapshot.models.length} Arena front-end rows to ${OUT_PATH}`,
  );
}

export function extractArenaFrontendWebDev(html) {
  const pageText = textFromHtml(html);
  const updatedOn = parseUpdatedOn(pageText);
  const totalVotes = requiredNumber(pageText.match(/([\d,]+)\s+votes\b/i)?.[1], "total votes");
  const modelCount = requiredNumber(pageText.match(/([\d,]+)\s+models\b/i)?.[1], "model count");
  const tbody = html.match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/i)?.[1];
  if (!tbody) throw new Error("Arena table body was not found");

  const rows = [...tbody.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
  const models = [];
  const seenIds = new Set();

  for (const rowMatch of rows) {
    const cells = [...rowMatch[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(
      (match) => match[1],
    );
    if (cells.length < 7) continue;

    const rank = requiredNumber(textFromHtml(cells[0]), "rank");
    if (rank > MAX_RANK) continue;
    const label = attributeValue(cells[2], "title");
    const modelCellText = textFromHtml(cells[2]);
    const organization =
      textFromHtml(cells[2].match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "") ||
      modelCellText.match(
        new RegExp(`${escapeRegExp(label)}\\s+([^·]+)\\s+·`, "i"),
      )?.[1]?.trim() ||
      "";
    const provider = providerFromOrganization(organization);
    if (!provider) continue;

    const modelMapping = MODEL_MAPPINGS.get(label);
    if (!modelMapping) {
      throw new Error(`Missing registry mapping for supported Arena row ${label}`);
    }
    if (modelMapping.provider !== provider) {
      throw new Error(`Provider mismatch for Arena row ${label}`);
    }

    const id = slugFrom(label);
    if (seenIds.has(id)) throw new Error(`Duplicate Arena row ${id}`);
    seenIds.add(id);

    const spread = numbersFrom(textFromHtml(cells[1]));
    const scoreText = textFromHtml(cells[3]);
    const scoreNumbers = numbersFrom(scoreText);
    const prices = numbersFrom(textFromHtml(cells[5]));
    if (spread.length < 2 || scoreNumbers.length < 2 || prices.length < 2) {
      throw new Error(`Incomplete Arena metrics for ${label}`);
    }

    models.push({
      id,
      label: displayLabel(label),
      provider,
      registryModelId: modelMapping.registryModelId,
      ...(modelMapping.configuration
        ? { configuration: modelMapping.configuration }
        : {}),
      rank,
      rankLow: spread[0],
      rankHigh: spread[1],
      score: scoreNumbers[0],
      confidence: scoreNumbers[1],
      votes: requiredNumber(textFromHtml(cells[4]), `votes for ${label}`),
      preliminary: /\bpreliminary\b/i.test(scoreText),
      inputPriceUsd: prices[0],
      outputPriceUsd: prices[1],
      ...optionalNumber("contextWindow", parseContextWindow(textFromHtml(cells[6]))),
      officialUrl: attributeValue(cells[2], "href"),
    });
  }

  if (!models.length) throw new Error("No supported Arena front-end rows found");

  return {
    updatedOn,
    voteCutoffAt: `${updatedOn}T00:00:00Z`,
    totalVotes,
    modelCount,
    models: models.sort((left, right) => left.rank - right.rank),
  };
}

export function validateRegistryMappings(models, modelsDev) {
  for (const model of models) {
    const providerModels = modelsDev?.[model.provider]?.models;
    if (!providerModels || !providerModels[model.registryModelId]) {
      throw new Error(
        `models.dev mapping target is unavailable: ${model.provider}:${model.registryModelId}`,
      );
    }
  }
}

function renderGeneratedModule(snapshot) {
  return `// Generated by scripts/extract-arena-frontend-webdev.mjs from ${SOURCE_URL}\n` +
    `export const ARENA_FRONTEND_WEBDEV_SOURCE_URL = ${JSON.stringify(SOURCE_URL)};\n` +
    `export const ARENA_FRONTEND_WEBDEV_CHECKED_AT = ${JSON.stringify(snapshot.checkedAt)};\n` +
    `export const ARENA_FRONTEND_WEBDEV_MAX_AGE_DAYS = ${MAX_AGE_DAYS};\n` +
    `export const ARENA_FRONTEND_WEBDEV_UPDATED_ON = ${JSON.stringify(snapshot.updatedOn)};\n` +
    `export const ARENA_FRONTEND_WEBDEV_VOTE_CUTOFF_AT = ${JSON.stringify(snapshot.voteCutoffAt)};\n` +
    `export const ARENA_FRONTEND_WEBDEV_TOTAL_VOTES = ${snapshot.totalVotes.toLocaleString("en-US").replaceAll(",", "_")};\n` +
    `export const ARENA_FRONTEND_WEBDEV_MODEL_COUNT = ${snapshot.modelCount};\n\n` +
    `export type ArenaFrontendWebDevModel = {\n` +
    `  id: string;\n  label: string;\n` +
    `  provider: "anthropic" | "google" | "moonshotai" | "openai" | "xai";\n` +
    `  registryModelId: string;\n` +
    `  configuration?: { displayLabel: string; effort?: "high" | "xhigh"; harness?: "codex" };\n` +
    `  rank: number;\n  rankLow: number;\n  rankHigh: number;\n  score: number;\n` +
    `  confidence: number;\n  votes: number;\n  preliminary: boolean;\n` +
    `  inputPriceUsd: number;\n  outputPriceUsd: number;\n  contextWindow?: number;\n  officialUrl: string;\n};\n\n` +
    `export const ARENA_FRONTEND_WEBDEV_MODELS: ArenaFrontendWebDevModel[] = ${JSON.stringify(snapshot.models, null, 2)};\n`;
}

function mapping(provider, registryModelId, displayLabel, effort, harness) {
  return {
    provider,
    registryModelId,
    ...(displayLabel
      ? {
          configuration: {
            displayLabel,
            ...(effort ? { effort } : {}),
            ...(harness ? { harness } : {}),
          },
        }
      : {}),
  };
}

async function fetchText(url, source) {
  const response = await fetch(url, { headers: { "user-agent": "IT Solver AI Registry weekly extractor" } });
  if (!response.ok) throw new Error(`${source} returned ${response.status}`);
  return response.text();
}

async function fetchJson(url, source) {
  const response = await fetch(url, { headers: { "user-agent": "IT Solver AI Registry weekly extractor" } });
  if (!response.ok) throw new Error(`${source} returned ${response.status}`);
  return response.json();
}

function parseUpdatedOn(value) {
  const match = value.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})\b/i);
  if (!match) throw new Error("Arena updated date was not found");
  const parsed = new Date(`${match[1]} ${match[2]}, ${match[3]} 00:00:00 UTC`);
  if (!Number.isFinite(parsed.getTime())) throw new Error("Arena updated date was invalid");
  return parsed.toISOString().slice(0, 10);
}

function providerFromOrganization(value) {
  return SUPPORTED_ORGANIZATIONS.get(value.toLowerCase().replace(/[^a-z0-9]+/g, ""));
}

function displayLabel(value) {
  return value
    .replace(" (codex-harness)", " (Codex harness)")
    .replace(/(\d)-(\d)/g, "$1.$2")
    .replaceAll("-", " ")
    .replace(/^gpt\s/i, "GPT-")
    .replace(/^kimi\s/i, "Kimi ")
    .replace(/^claude\s/i, "Claude ")
    .replace(/^grok\s/i, "Grok ")
    .replace(/^gemini\s/i, "Gemini ")
    .replace(/\bxhigh\b/i, "xhigh")
    .replace(/\bhigh\b/i, "High")
    .replace(/\bmax\b/i, "Max")
    .replace(/\bopus\b/i, "Opus")
    .replace(/\bfable\b/i, "Fable")
    .replace(/\bsonnet\b/i, "Sonnet")
    .replace(/\bsol\b/i, "Sol");
}

function attributeValue(value, name) {
  const match = value.match(new RegExp(`${name}="([^"]+)"`, "i"));
  if (!match?.[1]) throw new Error(`Arena ${name} attribute was not found`);
  return decodeHtml(match[1]);
}

function parseContextWindow(value) {
  const match = value.match(/([\d.]+)\s*([KM])?/i);
  if (!match) return undefined;
  const number = Number(match[1]);
  const multiplier = match[2]?.toUpperCase() === "M" ? 1_000_000 : match[2]?.toUpperCase() === "K" ? 1_000 : 1;
  return Number.isFinite(number) ? Math.round(number * multiplier) : undefined;
}

function numbersFrom(value) {
  return [...value.replaceAll(",", "").matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
}

function requiredNumber(value, label) {
  const number = Number(String(value ?? "").replaceAll(",", "").match(/\d+(?:\.\d+)?/)?.[0]);
  if (!Number.isFinite(number)) throw new Error(`Arena ${label} was not found`);
  return number;
}

function optionalNumber(key, value) {
  return value === undefined ? {} : { [key]: value };
}

function slugFrom(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function textFromHtml(value) {
  return decodeHtml(String(value).replace(/<!--.*?-->/gs, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value) {
  return value
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}
