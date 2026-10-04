import { MUSIC_NOISE_BAND_CENTRES, MUSIC_NOISE_LENGTH } from "#src/audio/constants";
import { transformFourier } from "#src/audio/transformFourier";

// An instrument's noise as samples: for each octave band of `MUSIC_NOISE_BAND_CENTRES`, a spectrum flat between the
// Half octaves either side of its centre and empty everywhere else, each bin's phase a hash of the bin and the band,
// Scaled to the standard deviation the instrument gives that band, the bands summed and turned into samples by one
// Inverse transform. A band of unit bins has the deviation of the square root of their count, mirrors included, so
// Each is scaled in the spectrum and none is transformed alone. Built in the spectrum, no band leaks into another, the
// Loop is seamless, and an offline render of the same notes is the same every time
export const computeNoiseSamples = (noiseBands: readonly number[], sampleRate: number): Float32Array => {
  // A real signal's spectrum mirrors itself, conjugated; the inverse transform is the forward one of the conjugate
  const real = new Float64Array(MUSIC_NOISE_LENGTH);
  const imaginary = new Float64Array(MUSIC_NOISE_LENGTH);
  for (let band = 0; band < noiseBands.length; band++) {
    const level = noiseBands[band] ?? 0;
    const centre = MUSIC_NOISE_BAND_CENTRES[band] ?? sampleRate;
    const lowBin = Math.max(Math.ceil(((centre / Math.SQRT2) * MUSIC_NOISE_LENGTH) / sampleRate), 1);
    const highBin = Math.min(
      Math.floor((centre * Math.SQRT2 * MUSIC_NOISE_LENGTH) / sampleRate),
      MUSIC_NOISE_LENGTH / 2 - 1,
    );
    if (level <= 0 || lowBin > highBin) continue;
    const amplitude = level / Math.sqrt(2 * (highBin - lowBin + 1));
    for (let bin = lowBin; bin <= highBin; bin++) {
      const hash = Math.sin(bin * 12.9898 + band * 78.233) * 43_758.5453;
      const phase = 2 * Math.PI * (hash - Math.floor(hash));
      const binReal = amplitude * Math.cos(phase);
      const binImaginary = amplitude * Math.sin(phase);
      real[bin] = (real[bin] ?? 0) + binReal;
      real[MUSIC_NOISE_LENGTH - bin] = (real[MUSIC_NOISE_LENGTH - bin] ?? 0) + binReal;
      imaginary[bin] = (imaginary[bin] ?? 0) - binImaginary;
      imaginary[MUSIC_NOISE_LENGTH - bin] = (imaginary[MUSIC_NOISE_LENGTH - bin] ?? 0) + binImaginary;
    }
  }
  transformFourier(real, imaginary);
  return Float32Array.from(real);
};
