import type { PcmClip } from "#src/models/PcmClip";

import { MIN_SPEECH_PEAK_DB, SPEECH_FLOOR_DB } from "#src/services/constants";
import { getFrameEnergiesDb } from "#src/services/getFrameEnergiesDb";

// Whether a synthesis is speech to the ear: loud enough to hear at its loudest, and with a pause somewhere in it.
// A vocoder run wrong by its provider returns a constant near-silence that fails both, and throws nothing
export const checkIsSpeech = (clip: PcmClip): boolean => {
  const energiesDb = getFrameEnergiesDb(clip);
  const peakDb = Math.max(...energiesDb);
  return peakDb >= MIN_SPEECH_PEAK_DB && Math.min(...energiesDb) <= peakDb - SPEECH_FLOOR_DB;
};
