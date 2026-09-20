import type { ClipProfile } from "#src/models/voiceMatch/ClipProfile";
import type { PcmClip } from "#src/models/voiceMatch/PcmClip";
import type { SpeakerEmbedder } from "#src/models/voiceMatch/SpeakerEmbedder";

import { getFrameAnalysis } from "#src/services/voiceMatch/getFrameAnalysis";
import { getSignalToNoiseDb } from "#src/services/voiceMatch/getSignalToNoiseDb";
import { getSpeechSeconds } from "#src/services/voiceMatch/getSpeechSeconds";
import { getSyllableCount } from "#src/services/voiceMatch/getSyllableCount";

// Everything one clip contributes, read once off the same frames. The clip is already at the model's sample rate
export const getClipProfile = async (clip: PcmClip, embed: SpeakerEmbedder): Promise<ClipProfile> => {
  const frameAnalysis = getFrameAnalysis(clip);
  const embedding = await embed(clip.samples);
  return {
    embedding,
    signalToNoiseDb: getSignalToNoiseDb(frameAnalysis),
    speechSeconds: getSpeechSeconds(frameAnalysis),
    syllables: getSyllableCount(frameAnalysis),
    voicedF0sHz: frameAnalysis.f0sHz.filter((f0Hz) => f0Hz > 0),
  };
};
