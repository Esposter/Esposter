import type { SoundEffect } from "#src/models/audio/SoundEffect";

import { computeSoundEffectSamples } from "#src/audio/computeSoundEffectSamples";
import { SOUND_EFFECT_BAND_EDGES } from "#src/audio/constants";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A sound effect of a few frames and one of many, each count its own group, since the cost follows the frames alone
const BENCH_FRAME_COUNTS = [4, 32];
// A silent effect against one with every band lit at each count, so `vs base` isolates what lighting the bands costs
describe(computeSoundEffectSamples, () => {
  const sampleRate = 48_000;
  const frameSeconds = 0.05;

  test.for(BENCH_FRAME_COUNTS)("%i frames", async (frameCount, { bench }) => {
    const createSoundEffect = (level: number): SoundEffect => {
      const levels = Array.from({ length: frameCount }, () => SOUND_EFFECT_BAND_EDGES.slice(1).map(() => level));
      return { frameSeconds, leftLevels: levels, rightLevels: levels, sharedLevels: levels };
    };
    const silentEffect = createSoundEffect(0);
    const litEffect = createSoundEffect(1);
    await bench.compare(
      bench("silent", () => {
        computeSoundEffectSamples(silentEffect, sampleRate);
      }),
      bench("lit", () => {
        computeSoundEffectSamples(litEffect, sampleRate);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
