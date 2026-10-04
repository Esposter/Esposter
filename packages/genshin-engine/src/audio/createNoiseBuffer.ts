import { computeNoiseSamples } from "#src/audio/computeNoiseSamples";
import { MUSIC_NOISE_LENGTH } from "#src/audio/constants";

// An instrument's noise, looped under each of its notes, as a buffer at the context's rate. An instrument with no
// Noise has no buffer
export const createNoiseBuffer = (context: BaseAudioContext, noiseBands: number[]): AudioBuffer | undefined => {
  if (noiseBands.every((level) => level <= 0)) return undefined;
  const { sampleRate } = context;
  const buffer = new AudioBuffer({ length: MUSIC_NOISE_LENGTH, sampleRate });
  buffer.getChannelData(0).set(computeNoiseSamples(noiseBands, sampleRate));
  return buffer;
};
