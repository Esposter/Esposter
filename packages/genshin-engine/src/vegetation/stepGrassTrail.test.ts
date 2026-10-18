import { computeGrassTrailTexelIndex } from "#src/vegetation/computeGrassTrailTexelIndex";
import { GRASS_TRAIL_FADE_SECONDS } from "#src/vegetation/constants";
import { createGrassTrail } from "#src/vegetation/createGrassTrail";
import { stepGrassTrail } from "#src/vegetation/stepGrassTrail";
import { Vector2 } from "three";
import { describe, expect, test } from "vitest";

const FRAME_SECONDS = 0.1;

describe(stepGrassTrail, () => {
  test("A stamp bends the footing the character walks through", () => {
    expect.hasAssertions();

    const trail = createGrassTrail();
    stepGrassTrail(trail, new Vector2(0, 0), new Vector2(1, 0), FRAME_SECONDS);

    const stampedIndex = computeGrassTrailTexelIndex(0, 0);
    expect(Array.from(trail.bends.slice(stampedIndex * 2, stampedIndex * 2 + 2))).toStrictEqual([1, 0]);
    const farIndex = computeGrassTrailTexelIndex(3, 0);
    expect(Array.from(trail.bends.slice(farIndex * 2, farIndex * 2 + 2))).toStrictEqual([0, 0]);
  });

  test("A stamp fades over the trail's fade time", () => {
    expect.hasAssertions();

    const trail = createGrassTrail();
    stepGrassTrail(trail, new Vector2(0, 0), new Vector2(1, 0), FRAME_SECONDS);
    stepGrassTrail(trail, new Vector2(0, 0), new Vector2(), GRASS_TRAIL_FADE_SECONDS);

    const stampedIndex = computeGrassTrailTexelIndex(0, 0);
    expect(trail.bends[stampedIndex * 2]).toBeCloseTo(Math.exp(-1), 5);
  });

  test("The trail follows the character", () => {
    expect.hasAssertions();

    const trail = createGrassTrail();
    stepGrassTrail(trail, new Vector2(0, 0), new Vector2(1, 0), FRAME_SECONDS);
    stepGrassTrail(trail, new Vector2(100, 100), new Vector2(), FRAME_SECONDS);

    expect(trail.center.value.toArray()).toStrictEqual([100.125, 100.125]);
    const formerIndex = computeGrassTrailTexelIndex(0, 0);
    expect(Array.from(trail.bends.slice(formerIndex * 2, formerIndex * 2 + 2))).toStrictEqual([0, 0]);
  });
});
