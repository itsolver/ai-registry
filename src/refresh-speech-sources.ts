import { parseArtificialAnalysisSpeechToSpeechApi } from "./aa-speech-to-speech";
import { AA_SPEECH_TO_SPEECH_MODELS } from "./generated/aa-speech-to-speech";
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

function apiRows<T>(
  body: Record<string, unknown>,
  source: string,
): T[] {
  if (!Array.isArray(body.data) || body.data.length === 0) {
    throw new Error(`${source} is empty or invalid`);
  }
  return body.data as T[];
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
  apiRows<unknown>(s2sBody, "AA S2S");

  const freeSpeechToText = sttBody.tier === "free";
  const freeSpeechToSpeech = s2sBody.tier === "free";
  const speechToSpeechModels = freeSpeechToSpeech
    ? [
        ...(AA_SPEECH_TO_SPEECH_MODELS as readonly ArtificialAnalysisSpeechToSpeechModel[]),
      ]
    : parseArtificialAnalysisSpeechToSpeechApi(s2sBody);
  if (speechToSpeechModels.length === 0) {
    throw new Error("AA S2S is empty or invalid");
  }

  return {
    speechToTextModels: freeSpeechToText ? [] : speechToTextRows,
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
