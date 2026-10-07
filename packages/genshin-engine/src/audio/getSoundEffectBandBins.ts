import { SOUND_EFFECT_BAND_EDGES, SOUND_EFFECT_FRAME_LENGTH } from "#src/audio/constants";

// The bins of a `SOUND_EFFECT_FRAME_LENGTH` frame at a rate each band of `SOUND_EFFECT_BAND_EDGES` spans, first and
// Last, every band holding one bin or more, the frame's first bin the lowest any reaches and none past its last
export const getSoundEffectBandBins = (sampleRate: number): (readonly [number, number])[] =>
  SOUND_EFFECT_BAND_EDGES.slice(1).map((high, band) => {
    const low = SOUND_EFFECT_BAND_EDGES[band] ?? 0;
    const lowBin = Math.max(Math.round((low * SOUND_EFFECT_FRAME_LENGTH) / sampleRate), 1);
    const highBin = Math.min(
      Math.round((high * SOUND_EFFECT_FRAME_LENGTH) / sampleRate) - 1,
      SOUND_EFFECT_FRAME_LENGTH / 2 - 1,
    );
    return [lowBin, Math.max(highBin, lowBin)] as const;
  });
