import { MUSIC_HARMONIC_COUNT, MUSIC_NOISE_CLEAR_BINS } from "#src/services/genshinAssets/shared/constants";
import { toFrequency } from "#src/services/genshinAssets/shared/toFrequency";

// The bins a note's partials hold in a spectrum, each from `MUSIC_NOISE_CLEAR_BINS` below a harmonic to as many above
// It (the end exclusive), up to the last harmonic under the half rate: as far out as a partial's leakage through a Hann
// Window's sidelobes stands above a mix's noise. A clearance growing with the partial, as an instrument's fit keeps,
// Would cover every bin past a note's seventeenth harmonic
export const readPartialBinRanges = (pitch: number, binWidth: number, binCount: number): [number, number][] => {
  const fundamental = toFrequency(pitch);
  const ranges: [number, number][] = [];
  for (let harmonic = 1; harmonic <= MUSIC_HARMONIC_COUNT; harmonic++) {
    const bin = Math.round((harmonic * fundamental) / binWidth);
    if (bin >= binCount) break;
    ranges.push([Math.max(bin - MUSIC_NOISE_CLEAR_BINS, 0), Math.min(bin + MUSIC_NOISE_CLEAR_BINS + 1, binCount)]);
  }
  return ranges;
};
