import type { SpeakerEmbedder } from "#src/models/voiceMatch/SpeakerEmbedder";

import { MODELS_DIRECTORY, SPEAKER_MODEL_ID } from "#src/services/voiceMatch/constants";
import { AutoProcessor, env, WavLMForXVector } from "@huggingface/transformers";

// A speaker-verification encoder in process: one utterance in, one unit vector out, and the cosine between two of
// Them is the field's timbre score. The model is fetched once into the work directory and read from there after
export const createSpeakerEmbedder = async (): Promise<SpeakerEmbedder> => {
  env.cacheDir = MODELS_DIRECTORY;
  const processor = await AutoProcessor.from_pretrained(SPEAKER_MODEL_ID);
  const model = await WavLMForXVector.from_pretrained(SPEAKER_MODEL_ID);

  return async (samples) => {
    const inputs = await processor(samples);
    const { embeddings } = await model(inputs);
    const vector = new Float32Array(embeddings.data as Float32Array);
    const norm = Math.hypot(...vector);
    return vector.map((value) => value / norm);
  };
};
