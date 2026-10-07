import { computeSpectrogram } from "#src/services/genshinAssets/shared/computeSpectrogram";
import { SOUND_FRAME_LENGTH, SOUND_HOP_LENGTH, SOUND_SAMPLE_RATE } from "#src/services/genshinAssets/shared/constants";
import { computeBandBins } from "#src/services/genshinParity/shared/computeBandBins";
import { MUSIC_NOISE_BAND_CENTRES } from "genshin-engine";

// A Hann window's power over its samples, three eighths, and a real signal's spectrum mirrored
const POWER_SCALE = 2 / (SOUND_FRAME_LENGTH * SOUND_FRAME_LENGTH * (3 / 8));
// A sound's power in each octave band of `MUSIC_NOISE_BAND_CENTRES`, frame by frame every `SOUND_HOP_LENGTH`: a Hann
// Window's band of bins over the window's own power, so a band's power is its noise's variance, as
// `computeNoiseSamples` sounds it, each window centred on its frame by leading the sound with half a window of silence
export const computeSoundBandPowers = (samples: Float32Array): number[][] => {
  const padded = new Float32Array(samples.length + SOUND_FRAME_LENGTH / 2);
  padded.set(samples, SOUND_FRAME_LENGTH / 2);
  const { binCount, frameCount, magnitudes } = computeSpectrogram(
    padded,
    SOUND_SAMPLE_RATE,
    SOUND_FRAME_LENGTH,
    SOUND_HOP_LENGTH,
  );
  const bandBins = MUSIC_NOISE_BAND_CENTRES.map((centre) =>
    computeBandBins(centre, SOUND_SAMPLE_RATE, SOUND_FRAME_LENGTH, binCount),
  );
  return Array.from({ length: frameCount }, (_value, frame) =>
    bandBins.map(([low, high]) => {
      let power = 0;
      for (let bin = low; bin <= high; bin++) power += (magnitudes[frame * binCount + bin] ?? 0) ** 2;
      return power * POWER_SCALE;
    }),
  );
};
