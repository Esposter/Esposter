import { SOUND_EFFECT_BAND_EDGES, SOUND_EFFECT_FRAME_LENGTH } from "#src/audio/constants";

// The bins of a `SOUND_EFFECT_FRAME_LENGTH` frame at a rate each band of `SOUND_EFFECT_BAND_EDGES` spans, first and
// Last, every band holding one bin or more, the frame's first bin the lowest any reaches and none past its last. A band
// Starting past the frame's last bin, above the rate's Nyquist, spans none, since its bins would mirror below it
export const getSoundEffectBandBins = (sampleRate: number): (readonly [number, number])[] =>
  SOUND_EFFECT_BAND_EDGES.slice(1).map((high, band) => {
    const low = SOUND_EFFECT_BAND_EDGES[band] ?? 0;
    const lowBin = Math.max(Math.round((low * SOUND_EFFECT_FRAME_LENGTH) / sampleRate), 1);
    const highBin = Math.max(Math.round((high * SOUND_EFFECT_FRAME_LENGTH) / sampleRate) - 1, lowBin);
    return [lowBin, Math.min(highBin, SOUND_EFFECT_FRAME_LENGTH / 2 - 1)] as const;
  });
