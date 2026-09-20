import type { ClipProfile } from "#src/models/voiceMatch/ClipProfile";
import type { SpeakerEmbedder } from "#src/models/voiceMatch/SpeakerEmbedder";
import type { PcmClip } from "@esposter/genshin-persona/src/models/PcmClip.ts";

import { MAX_EMBEDDED_SECONDS, MODEL_SAMPLE_RATE } from "#src/services/voiceMatch/constants";
import { getFrameEnergiesDb } from "#src/services/voiceMatch/getFrameEnergiesDb";
import { getSignalToNoiseDb } from "#src/services/voiceMatch/getSignalToNoiseDb";
import { getSpeechSeconds } from "#src/services/voiceMatch/getSpeechSeconds";

// Everything one clip contributes, read once off the same frames. The clip is already at the model's sample rate;
// The energies are read over all of it and the embedding over its opening seconds
export const getClipProfile = async (clip: PcmClip, embed: SpeakerEmbedder): Promise<ClipProfile> => {
  const energiesDb = getFrameEnergiesDb(clip);
  const embedding = await embed(clip.samples.subarray(0, MODEL_SAMPLE_RATE * MAX_EMBEDDED_SECONDS));
  return {
    embedding,
    signalToNoiseDb: getSignalToNoiseDb(energiesDb),
    speechSeconds: getSpeechSeconds(energiesDb),
  };
};
