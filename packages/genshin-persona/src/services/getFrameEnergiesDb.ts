import type { PcmClip } from "#src/models/PcmClip";

import { FRAME_SECONDS, HOP_SECONDS } from "#src/services/constants";

const DECIBELS_PER_DECADE = 10;
// Keeps a silent frame finite; far below anything a voiced frame measures
const SILENCE_POWER = 1e-10;
// The energy of every frame, which is what a clip's speech seconds and its noise floor are read off
export const getFrameEnergiesDb = ({ sampleRate, samples }: PcmClip): number[] => {
  const frameLength = Math.round(sampleRate * FRAME_SECONDS);
  const hop = Math.round(sampleRate * HOP_SECONDS);
  const energiesDb: number[] = [];
  for (let start = 0; start + frameLength <= samples.length; start += hop) {
    let power = 0;
    for (const sample of samples.subarray(start, start + frameLength)) power += sample * sample;
    energiesDb.push(DECIBELS_PER_DECADE * Math.log10(power / frameLength + SILENCE_POWER));
  }

  return energiesDb;
};
