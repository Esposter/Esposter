import type { SoundEffect } from "#src/models/audio/SoundEffect";

import { computeSoundEffectSamples } from "#src/audio/computeSoundEffectSamples";

// A sound effect rendered once into a buffer of two channels at the context's rate, played as often as it sounds
export const createSoundEffectBuffer = (context: BaseAudioContext, soundEffect: SoundEffect): AudioBuffer => {
  const { sampleRate } = context;
  const channels = computeSoundEffectSamples(soundEffect, sampleRate);
  const buffer = new AudioBuffer({ length: Math.max(channels[0].length, 1), numberOfChannels: 2, sampleRate });
  for (const [channel, samples] of channels.entries()) buffer.getChannelData(channel).set(samples);
  return buffer;
};
