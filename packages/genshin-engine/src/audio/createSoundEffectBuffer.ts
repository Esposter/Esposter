import type { SoundEffect } from "#src/models/audio/SoundEffect";

import { computeSoundEffectSamples } from "#src/audio/computeSoundEffectSamples";

// A sound effect rendered once into a buffer at the context's rate, played as often as it sounds
export const createSoundEffectBuffer = (context: BaseAudioContext, soundEffect: SoundEffect): AudioBuffer => {
  const { sampleRate } = context;
  const samples = computeSoundEffectSamples(soundEffect, sampleRate);
  const buffer = new AudioBuffer({ length: Math.max(samples.length, 1), sampleRate });
  buffer.getChannelData(0).set(samples);
  return buffer;
};
