import type { Spectrogram } from "#src/models/genshinAssets/shared/Spectrogram";

import { computeBandBins } from "#src/services/genshinParity/shared/computeBandBins";
import { CHROMA_FRAME_LENGTH, LISTEN_BAND_CENTRES } from "#src/services/genshinParity/shared/constants";

// Each octave band's energy frame by frame, between the half octaves either side of its centre, in the pitch classes'
// Own frames
export const computeBandEnergies = ({ binCount, frameCount, magnitudes, sampleRate }: Spectrogram): Float64Array[] =>
  LISTEN_BAND_CENTRES.map((centre) => {
    const [low, high] = computeBandBins(centre, sampleRate, CHROMA_FRAME_LENGTH, binCount);
    return Float64Array.from({ length: frameCount }, (_value, frame) => {
      let energy = 0;
      for (let bin = low; bin <= high; bin++) energy += (magnitudes[frame * binCount + bin] ?? 0) ** 2;
      return energy;
    });
  });
