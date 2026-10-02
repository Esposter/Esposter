import type { Chroma } from "#src/models/genshinParity/Chroma";

import { CHROMA_QUIET_SHARE } from "#src/services/genshinParity/constants";

// How well a window of one signal's pitch classes matches another's at its best alignment: the mean dot product of
// Their frames over every lag that overlaps at least half the window, the frames either side quieter than their own
// Loudest's share left out. The lag is in frames, where the window's first frame falls in the other signal, and may
// Be negative when the window starts before it
export const scoreChromaWindow = (
  window: Chroma,
  start: number,
  length: number,
  other: Chroma,
): { lag: number; score: number } => {
  const windowQuiet = Math.max(...window.loudness) * CHROMA_QUIET_SHARE;
  const otherQuiet = Math.max(...other.loudness) * CHROMA_QUIET_SHARE;
  const otherLength = other.loudness.length;
  const minimumOverlap = length / 2;
  let best = { lag: 0, score: -1 };
  for (let lag = 1 - length; lag < otherLength; lag++) {
    let sum = 0;
    let count = 0;
    for (let index = Math.max(0, -lag); index < length && lag + index < otherLength; index++) {
      const frame = start + index;
      const otherFrame = lag + index;
      if ((window.loudness[frame] ?? 0) < windowQuiet || (other.loudness[otherFrame] ?? 0) < otherQuiet) continue;
      let dot = 0;
      for (let pitchClass = 0; pitchClass < 12; pitchClass++)
        dot += (window.classes[frame * 12 + pitchClass] ?? 0) * (other.classes[otherFrame * 12 + pitchClass] ?? 0);
      sum += dot;
      count++;
    }
    if (count >= minimumOverlap && sum / count > best.score) best = { lag, score: sum / count };
  }
  return best;
};
