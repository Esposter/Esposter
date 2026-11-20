import type { ClipProfile } from "#src/models/voiceMatch/ClipProfile";
import type { SpeakerEmbedder } from "#src/models/voiceMatch/SpeakerEmbedder";
import type { PcmClip } from "genshin-persona/src/models/PcmClip.ts";

import { computeSpeechSeconds } from "#src/services/voiceMatch/computeSpeechSeconds";
import { MAX_EMBEDDED_SECONDS, MODEL_SAMPLE_RATE } from "#src/services/voiceMatch/constants";
import { getSignalToNoiseDb } from "#src/services/voiceMatch/getSignalToNoiseDb";
import { getFrameEnergiesDb } from "genshin-persona/src/services/getFrameEnergiesDb.ts";

// Everything one clip contributes, read once off the same frames. The clip is already at the model's sample rate;
// The energies are read over all of it and the embedding over its opening seconds
export const computeClipProfile = async (clip: PcmClip, embed: SpeakerEmbedder): Promise<ClipProfile> => {
  const energiesDb = getFrameEnergiesDb(clip);
  const embedding = await embed(clip.samples.subarray(0, MODEL_SAMPLE_RATE * MAX_EMBEDDED_SECONDS));
  return {
    embedding,
    signalToNoiseDb: getSignalToNoiseDb(energiesDb),
    speechSeconds: computeSpeechSeconds(energiesDb),
  };
};
