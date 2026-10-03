import { MUSIC_NOISE_SECONDS } from "#src/audio/constants";

// White noise of unit standard deviation, a second of it looped under every note: each sample a hash of its index,
// Uniform over [-√3, √3], so an offline render of the same notes is the same every time
export const createNoiseBuffer = (context: BaseAudioContext): AudioBuffer => {
  const buffer = new AudioBuffer({
    length: Math.round(MUSIC_NOISE_SECONDS * context.sampleRate),
    sampleRate: context.sampleRate,
  });
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index++) {
    const hash = Math.sin(index * 12.9898) * 43_758.5453;
    samples[index] = Math.sqrt(3) * (2 * (hash - Math.floor(hash)) - 1);
  }
  return buffer;
};
