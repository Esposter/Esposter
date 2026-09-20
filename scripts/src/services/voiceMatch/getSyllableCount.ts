import type { FrameAnalysis } from "#src/models/voiceMatch/FrameAnalysis";

import { SPEECH_FLOOR_DB, SYLLABLE_DIP_DB } from "#src/services/voiceMatch/constants";
import { getFloorDb } from "#src/services/voiceMatch/getFloorDb";

// Syllable nuclei counted the way the field's rate scripts count them: a voiced energy peak, loud enough to be
// Speech, with a dip of a few decibels since the last nucleus so that one long vowel is one syllable. Text-free, so
// The same count is read off a cast's line in any track and a synthetic voice's carrier — each corpus's own rate is
// Then divided out by its median before the two are compared
export const getSyllableCount = ({ energiesDb, f0sHz }: FrameAnalysis): number => {
  const speechFloorDb = getFloorDb(energiesDb, SPEECH_FLOOR_DB);
  let count = 0;
  // The quietest frame since the last nucleus; before the first, any level is a dip
  let valleyDb = -Infinity;
  for (const [index, energyDb] of energiesDb.entries()) {
    const previousDb = energiesDb[index - 1] ?? -Infinity;
    const nextDb = energiesDb[index + 1] ?? -Infinity;
    const isPeak = energyDb >= previousDb && energyDb > nextDb && energyDb >= speechFloorDb;
    if (isPeak && (f0sHz[index] ?? 0) > 0 && energyDb - valleyDb >= SYLLABLE_DIP_DB) {
      count += 1;
      valleyDb = energyDb;
    } else valleyDb = Math.min(valleyDb, energyDb);
  }

  return count;
};
