import type { Spectrogram } from "#src/models/recreation/signal/Spectrogram";

import { LISTEN_BAND_CENTRES } from "#src/services/genshinParity/shared/constants";
import { computeBandBins } from "#src/services/recreation/signal/computeBandBins";

// Each octave band's energy frame by frame, between the half octaves either side of its centre, in the pitch classes'
// Own frames
export const computeBandEnergies = ({
  binCount,
  frameCount,
  frameLength,
  magnitudes,
  sampleRate,
}: Spectrogram): Float64Array[] =>
  LISTEN_BAND_CENTRES.map((centre) => {
    const [low, high] = computeBandBins(centre, sampleRate, frameLength, binCount);
    return Float64Array.from({ length: frameCount }, (_value, frame) => {
      let energy = 0;
      for (let bin = low; bin <= high; bin++) energy += (magnitudes[frame * binCount + bin] ?? 0) ** 2;
      return energy;
    });
  });
