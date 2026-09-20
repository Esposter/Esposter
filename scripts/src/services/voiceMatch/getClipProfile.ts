import type { ClipProfile } from "#src/models/voiceMatch/ClipProfile";
import type { PcmClip } from "#src/models/voiceMatch/PcmClip";
import type { SpeakerEmbedder } from "#src/models/voiceMatch/SpeakerEmbedder";

import { MAX_EMBEDDED_SECONDS, MODEL_SAMPLE_RATE } from "#src/services/voiceMatch/constants";
import { getFrameAnalysis } from "#src/services/voiceMatch/getFrameAnalysis";
import { getSignalToNoiseDb } from "#src/services/voiceMatch/getSignalToNoiseDb";
import { getSpeechSeconds } from "#src/services/voiceMatch/getSpeechSeconds";
import { getSyllableCount } from "#src/services/voiceMatch/getSyllableCount";

// Everything one clip contributes, read once off the same frames. The clip is already at the model's sample rate;
// The prosody is read over all of it and the embedding over its opening seconds
export const getClipProfile = async (clip: PcmClip, embed: SpeakerEmbedder): Promise<ClipProfile> => {
  const frameAnalysis = getFrameAnalysis(clip);
  const embedding = await embed(clip.samples.subarray(0, MODEL_SAMPLE_RATE * MAX_EMBEDDED_SECONDS));
  return {
    embedding,
    signalToNoiseDb: getSignalToNoiseDb(frameAnalysis),
    speechSeconds: getSpeechSeconds(frameAnalysis),
    syllables: getSyllableCount(frameAnalysis),
    voicedF0sHz: frameAnalysis.f0sHz.filter((f0Hz) => f0Hz > 0),
  };
};
