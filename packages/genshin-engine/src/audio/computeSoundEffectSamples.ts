import type { SoundEffect } from "#src/models/audio/SoundEffect";

import { computeNoiseSamples } from "#src/audio/computeNoiseSamples";
import { MUSIC_NOISE_BAND_CENTRES, MUSIC_NOISE_LENGTH } from "#src/audio/constants";

// A sound effect as samples of our own noise: each octave band its own seamless noise at unit deviation
// (`computeNoiseSamples`, that band alone), looped for as long as the effect sounds, its level following the effect's
// Frames, read between two frames linearly, and the bands summed. Bands apart hold noise of their own, so their powers
// Add as the effect's measured levels do
export const computeSoundEffectSamples = ({ frameSeconds, levels }: SoundEffect, sampleRate: number): Float32Array => {
  const samples = new Float32Array(Math.ceil(levels.length * frameSeconds * sampleRate));
  for (const band of MUSIC_NOISE_BAND_CENTRES.keys()) {
    if (levels.every((frameLevels) => (frameLevels[band] ?? 0) <= 0)) continue;
    const noise = computeNoiseSamples(
      MUSIC_NOISE_BAND_CENTRES.map((_centre, index) => (index === band ? 1 : 0)),
      sampleRate,
    );
    for (let sample = 0; sample < samples.length; sample++) {
      const position = sample / sampleRate / frameSeconds;
      const frame = Math.floor(position);
      const share = position - frame;
      const level =
        (levels[frame]?.[band] ?? 0) * (1 - share) +
        (levels[Math.min(frame + 1, levels.length - 1)]?.[band] ?? 0) * share;
      samples[sample] = (samples[sample] ?? 0) + level * (noise[sample % MUSIC_NOISE_LENGTH] ?? 0);
    }
  }
  return samples;
};
