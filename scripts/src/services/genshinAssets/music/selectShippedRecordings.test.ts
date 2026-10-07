import type { SampleRegion } from "#src/models/genshinAssets/music/SampleRegion";

import { selectShippedRecordings } from "#src/services/genshinAssets/music/selectShippedRecordings";
import { RELEASE_TIME_CONSTANTS } from "genshin-engine";
import { describe, expect, test } from "vitest";

const createRegion = (keyCenter: number): SampleRegion => ({
  gain: 0,
  highKey: keyCenter,
  highVelocity: 127,
  keyCenter,
  lowKey: keyCenter,
  lowVelocity: 1,
  offset: 0,
  path: "",
  tune: 0,
});

describe(selectShippedRecordings, () => {
  const lowRegion = createRegion(60);
  const unplayedRegion = createRegion(66);
  const highRegion = createRegion(72);
  const instrument = { release: 0, tuning: 0 };

  test("keeps the regions the notes play in the instrument's order, each read as far as its furthest note", () => {
    expect.hasAssertions();

    const regionSecondsMap = selectShippedRecordings(
      [lowRegion, unplayedRegion, highRegion],
      [
        { duration: 1, pitch: 72, start: 0, velocity: 1 },
        { duration: 1, pitch: 60, start: 0, velocity: 1 },
        { duration: 2, pitch: 60, start: 1, velocity: 1 },
      ],
      instrument,
    );

    expect([...regionSecondsMap]).toStrictEqual([
      [lowRegion, 2],
      [highRegion, 1],
    ]);
  });

  test("reads a shifted note's recording at its rate, on through its release", () => {
    expect.hasAssertions();

    const regionSecondsMap = selectShippedRecordings([lowRegion], [{ duration: 1, pitch: 72, start: 0, velocity: 1 }], {
      ...instrument,
      release: 1,
    });

    expect(regionSecondsMap.get(lowRegion)).toBe((1 + RELEASE_TIME_CONSTANTS) * 2);
  });
});
