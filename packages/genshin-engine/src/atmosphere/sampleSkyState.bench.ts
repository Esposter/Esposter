import type { SkyKeyframe } from "#src/atmosphere/SkyKeyframe";

import { createSkyState } from "#src/atmosphere/createSkyState";
import { sampleSkyState } from "#src/atmosphere/sampleSkyState";
import { MINUTES_PER_DAY } from "#src/clock/constants";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { Color } from "three";
import { describe, test } from "vitest";

// A region's handful of keyframes and four times as many: sampling runs every frame, and its cost must stay flat
const BENCH_KEYFRAME_COUNTS = [4, 16];
const createSkyKeyframes = (count: number): SkyKeyframe[] =>
  Array.from({ length: count }, (_value, index) => ({
    cloudLitColor: new Color(),
    cloudShadeColor: new Color(),
    hemisphereGroundColor: new Color(),
    hemisphereIntensity: 1,
    hemisphereSkyColor: new Color(),
    horizonColor: new Color(),
    lightColor: new Color(),
    lightIntensity: 1,
    minutes: (index * MINUTES_PER_DAY) / count,
    starIntensity: 0,
    zenithColor: new Color(),
  }));
// Early in the day against late, so `vs base` shows what walking past more keyframes costs
describe(sampleSkyState, () => {
  test.for(BENCH_KEYFRAME_COUNTS)("%i keyframes", async (count, { bench }) => {
    const skyKeyframes = createSkyKeyframes(count);
    const skyState = createSkyState();
    await bench.compare(
      bench("early", () => {
        sampleSkyState(skyKeyframes, 1, 0, skyState);
      }),
      bench("late", () => {
        sampleSkyState(skyKeyframes, MINUTES_PER_DAY - 1, 0, skyState);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
