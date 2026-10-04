import { MUSIC_NOISE_BAND_CENTRES, MUSIC_NOISE_LENGTH } from "#src/audio/constants";
import { transformFourier } from "#src/audio/transformFourier";

// An instrument's noise, looped under each of its notes: for each octave band of `MUSIC_NOISE_BAND_CENTRES`, a
// Spectrum flat between the half octaves either side of its centre and empty everywhere else, each bin's phase a hash
// Of the bin and the band, turned into samples by the inverse transform and scaled to the standard deviation the
// Instrument gives that band, the bands summed. Built in the spectrum, no band leaks into another, the loop is seamless,
// And an offline render of the same notes is the same every time. An instrument with no noise has no buffer
export const createNoiseBuffer = (context: BaseAudioContext, noiseBands: number[]): AudioBuffer | undefined => {
  if (noiseBands.every((level) => level <= 0)) return undefined;
  const { sampleRate } = context;
  const buffer = new AudioBuffer({ length: MUSIC_NOISE_LENGTH, sampleRate });
  const samples = buffer.getChannelData(0);
  for (const [band, level] of noiseBands.entries()) {
    const centre = MUSIC_NOISE_BAND_CENTRES[band] ?? sampleRate;
    const lowBin = Math.max(Math.ceil(((centre / Math.SQRT2) * MUSIC_NOISE_LENGTH) / sampleRate), 1);
    const highBin = Math.min(
      Math.floor((centre * Math.SQRT2 * MUSIC_NOISE_LENGTH) / sampleRate),
      MUSIC_NOISE_LENGTH / 2 - 1,
    );
    if (level <= 0 || lowBin > highBin) continue;
    // A real signal's spectrum mirrors itself, conjugated; the inverse transform is the forward one of the conjugate
    const real = new Float64Array(MUSIC_NOISE_LENGTH);
    const imaginary = new Float64Array(MUSIC_NOISE_LENGTH);
    for (let bin = lowBin; bin <= highBin; bin++) {
      const hash = Math.sin(bin * 12.9898 + band * 78.233) * 43_758.5453;
      const phase = 2 * Math.PI * (hash - Math.floor(hash));
      real[bin] = Math.cos(phase);
      real[MUSIC_NOISE_LENGTH - bin] = Math.cos(phase);
      imaginary[bin] = -Math.sin(phase);
      imaginary[MUSIC_NOISE_LENGTH - bin] = Math.sin(phase);
    }
    transformFourier(real, imaginary);
    const deviation = Math.sqrt(real.reduce((sum, value) => sum + value ** 2, 0) / MUSIC_NOISE_LENGTH);
    for (const [sample, value] of real.entries())
      samples[sample] = (samples[sample] ?? 0) + (level * value) / deviation;
  }
  return buffer;
};
