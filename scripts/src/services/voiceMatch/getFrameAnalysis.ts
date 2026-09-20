import type { FrameAnalysis } from "#src/models/voiceMatch/FrameAnalysis";
import type { PcmClip } from "#src/models/voiceMatch/PcmClip";

import { FRAME_SECONDS, HOP_SECONDS, MAX_F0_HZ, MIN_F0_HZ, VOICED_FLOOR_DB } from "#src/services/voiceMatch/constants";
import { getFloorDb } from "#src/services/voiceMatch/getFloorDb";
import { getPitchLag } from "#src/services/voiceMatch/getPitchLag";

const DECIBELS_PER_DECADE = 10;
// Keeps a silent frame finite; far below anything a voiced frame measures
const SILENCE_POWER = 1e-10;

// Energy first for every frame, then pitch only for the frames loud enough to be voice: the autocorrelation is the
// One expensive step, and running it on the silence between lines would be most of the run
export const getFrameAnalysis = ({ sampleRate, samples }: PcmClip): FrameAnalysis => {
  const frameLength = Math.round(sampleRate * FRAME_SECONDS);
  const hop = Math.round(sampleRate * HOP_SECONDS);
  const minLag = Math.floor(sampleRate / MAX_F0_HZ);
  const maxLag = Math.ceil(sampleRate / MIN_F0_HZ);
  const frames: Float32Array[] = [];
  const energiesDb: number[] = [];
  for (let start = 0; start + frameLength <= samples.length; start += hop) {
    const frame = samples.subarray(start, start + frameLength);
    let power = 0;
    for (const sample of frame) power += sample * sample;
    frames.push(frame);
    energiesDb.push(DECIBELS_PER_DECADE * Math.log10(power / frameLength + SILENCE_POWER));
  }

  const voicedFloorDb = getFloorDb(energiesDb, VOICED_FLOOR_DB);
  const f0sHz = frames.map((frame, index) => {
    const energyDb = energiesDb[index] ?? -Infinity;
    if (energyDb < voicedFloorDb) return 0;

    const lag = getPitchLag(frame, minLag, maxLag);
    return lag > 0 ? sampleRate / lag : 0;
  });
  return { energiesDb, f0sHz };
};
