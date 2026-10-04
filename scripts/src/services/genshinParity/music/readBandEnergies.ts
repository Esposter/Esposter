import { computeSpectrogram } from "#src/services/genshinAssets/shared/computeSpectrogram";
import {
  CHROMA_FRAME_LENGTH,
  CHROMA_HOP_LENGTH,
  LISTEN_BAND_CENTRES,
} from "#src/services/genshinParity/shared/constants";
import { readBandBins } from "#src/services/genshinParity/shared/readBandBins";

// Each octave band's energy frame by frame, between the half octaves either side of its centre, in the pitch classes'
// Own frames
export const readBandEnergies = (samples: Float32Array, sampleRate: number): Float64Array[] => {
  const { binCount, frameCount, magnitudes } = computeSpectrogram(
    samples,
    sampleRate,
    CHROMA_FRAME_LENGTH,
    CHROMA_HOP_LENGTH,
  );
  return LISTEN_BAND_CENTRES.map((centre) => {
    const [low, high] = readBandBins(centre, sampleRate, CHROMA_FRAME_LENGTH, binCount);
    return Float64Array.from({ length: frameCount }, (_, frame) => {
      let energy = 0;
      for (let bin = low; bin <= high; bin++) energy += (magnitudes[frame * binCount + bin] ?? 0) ** 2;
      return energy;
    });
  });
};
