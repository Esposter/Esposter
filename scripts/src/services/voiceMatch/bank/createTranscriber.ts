import type { Transcriber } from "#src/models/voiceMatch/Transcriber";
import type { Transcription } from "#src/models/voiceMatch/Transcription";

import {
  MODELS_DIRECTORY,
  TRANSCRIBER_DTYPE,
  TRANSCRIBER_LANGUAGE,
  TRANSCRIBER_MAX_NEW_TOKENS,
  TRANSCRIBER_MODEL_ID,
} from "#src/services/voiceMatch/constants";
import { env, pipeline } from "@huggingface/transformers";

// A speech recogniser in process, told the language so it never spends the first token guessing it, and capped so a
// Voice that produces noise costs a sentence rather than a minute of repetition
export const createTranscriber = async (): Promise<Transcriber> => {
  env.cacheDir = MODELS_DIRECTORY;
  const transcribe = await pipeline("automatic-speech-recognition", TRANSCRIBER_MODEL_ID, {
    dtype: TRANSCRIBER_DTYPE,
  });

  return async (samples) => {
    const transcription = (await transcribe(samples, {
      language: TRANSCRIBER_LANGUAGE,
      max_new_tokens: TRANSCRIBER_MAX_NEW_TOKENS,
    })) as Transcription;
    return transcription.text;
  };
};
