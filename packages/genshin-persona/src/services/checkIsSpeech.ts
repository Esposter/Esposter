import type { PcmClip } from "#src/models/PcmClip";

import { checkIsAudible } from "#src/services/checkIsAudible";
import { SPEECH_FLOOR_DB } from "#src/services/constants";
import { getFrameEnergiesDb } from "#src/services/getFrameEnergiesDb";

// Whether a synthesis is speech to the ear: loud enough to hear at its loudest, and with a pause somewhere in it.
// A vocoder run wrong by its provider returns a constant near-silence that fails both, and throws nothing
export const checkIsSpeech = (clip: PcmClip): boolean => {
  const energiesDb = getFrameEnergiesDb(clip);
  if (checkIsAudible(energiesDb)) return Math.min(...energiesDb) <= Math.max(...energiesDb) - SPEECH_FLOOR_DB;
  else return false;
};
