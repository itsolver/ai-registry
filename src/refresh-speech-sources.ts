import { parseArtificialAnalysisSpeechToSpeechApi } from "./aa-speech-to-speech";
import { AA_SPEECH_TO_SPEECH_MODELS } from "./generated/aa-speech-to-speech";
import { AA_SPEECH_TO_TEXT_MODELS } from "./generated/aa-speech-to-text";
import {
  bundledVoiceSourceStatus,
  type ArtificialAnalysisSpeechToSpeechModel,
  type ArtificialAnalysisSpeechToTextModel,
  type VoiceSourceStatus,
} from "./registry";

export interface CatalogSpeechSources {
  speechToTextModels: ArtificialAnalysisSpeechToTextModel[];
  speechToSpeechModels: ArtificialAnalysisSpeechToSpeechModel[];
  voiceStatus: VoiceSourceStatus;
  shouldPersistVoiceCapture: boolean;
}

const MINIMUM_FREE_COVERAGE_RATIO = 0.5;

function apiRows<T>(
  body: Record<string, unknown>,
  source: string,
): T[] {
  if (!Array.isArray(body.data) || body.data.length === 0) {
    throw new Error(`${source} is empty or invalid`);
  }
  return body.data as T[];
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function nonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function finiteNumber(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

function validCreator(value: unknown): boolean {
  const creator = objectValue(value);
  return Boolean(
    creator && nonEmptyString(creator.id) && nonEmptyString(creator.name),
  );
}

function assertFreeCoverage(
  rowCount: number,
  bundledRowCount: number,
  source: string,
): void {
  const minimum = Math.max(
    1,
    Math.ceil(bundledRowCount * MINIMUM_FREE_COVERAGE_RATIO),
  );
  if (rowCount < minimum) {
    throw new Error(`${source} Free coverage is partial`);
  }
}

function validFreeSpeechToTextRow(value: unknown): boolean {
  const row = objectValue(value);
  return Boolean(
    row &&
      nonEmptyString(row.id) &&
      nonEmptyString(row.name) &&
      validCreator(row.model_creator) &&
      finiteNumber(row.aa_wer_index),
  );
}

function validFreeSpeechToSpeechRow(value: unknown): boolean {
  const row = objectValue(value);
  return Boolean(
    row &&
      nonEmptyString(row.id) &&
      nonEmptyString(row.name) &&
      nonEmptyString(row.slug) &&
      validCreator(row.model_creator) &&
      [row.bba_score, row.fdb_score, row.tau_voice_score].some(finiteNumber),
  );
}

function hasPricedSpeechToTextProviders(
  rows: ArtificialAnalysisSpeechToTextModel[],
): boolean {
  return rows.every((row) => {
    const providers = row.providers;
    return (
      Array.isArray(providers) &&
      providers.length > 0 &&
      providers.every((provider) => {
        const price = objectValue(provider)?.price_per_1k_minutes;
        return finiteNumber(price) && (price as number) > 0;
      })
    );
  });
}

function speechTier(
  body: Record<string, unknown>,
  source: string,
): "free" | "pro" {
  if (body.tier === "free" || body.tier === "pro") {
    return body.tier;
  }
  throw new Error(`${source} has an unknown tier`);
}

export function catalogSpeechSources(
  sttBody: Record<string, unknown>,
  s2sBody: Record<string, unknown>,
  evidenceTime: string,
): CatalogSpeechSources {
  const speechToTextRows = apiRows<ArtificialAnalysisSpeechToTextModel>(
    sttBody,
    "AA STT",
  );
  const speechToSpeechRows = apiRows<unknown>(s2sBody, "AA S2S");

  const freeSpeechToText = speechTier(sttBody, "AA STT") === "free";
  const freeSpeechToSpeech = speechTier(s2sBody, "AA S2S") === "free";
  if (freeSpeechToText) {
    if (!speechToTextRows.every(validFreeSpeechToTextRow)) {
      throw new Error("AA STT Free rows are invalid");
    }
    assertFreeCoverage(
      speechToTextRows.length,
      AA_SPEECH_TO_TEXT_MODELS.length,
      "AA STT",
    );
  }
  if (freeSpeechToSpeech) {
    if (!speechToSpeechRows.every(validFreeSpeechToSpeechRow)) {
      throw new Error("AA S2S Free rows are invalid");
    }
    assertFreeCoverage(
      speechToSpeechRows.length,
      AA_SPEECH_TO_SPEECH_MODELS.length,
      "AA S2S",
    );
  }
  const speechToSpeechModels = freeSpeechToSpeech
    ? [
        ...(AA_SPEECH_TO_SPEECH_MODELS as readonly ArtificialAnalysisSpeechToSpeechModel[]),
      ]
    : parseArtificialAnalysisSpeechToSpeechApi(s2sBody);
  if (speechToSpeechModels.length === 0) {
    throw new Error("AA S2S is empty or invalid");
  }

  return {
    speechToTextModels:
      !freeSpeechToText && hasPricedSpeechToTextProviders(speechToTextRows)
        ? speechToTextRows
        : [],
    speechToSpeechModels,
    voiceStatus: freeSpeechToSpeech
      ? bundledVoiceSourceStatus(evidenceTime)
      : {
          state: "live",
          origin: "aa_api",
          fetchedAt: evidenceTime,
          rowCount: speechToSpeechModels.length,
        },
    shouldPersistVoiceCapture: !freeSpeechToSpeech,
  };
}
