import type { WaterfallSheet } from "genshin-engine";

import { getDrawnWaterfalls } from "#src/services/world/getDrawnWaterfalls";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

const createWaterfall = (lip: Vector3, drop: number, width: number): WaterfallSheet => ({
  across: new Vector3(1, 0, 0),
  drop,
  lip,
  width,
});

describe(getDrawnWaterfalls, () => {
  test("draws no sheet with no drop, which lies flat on the ground, nor one with no width", () => {
    expect.hasAssertions();

    const fall = createWaterfall(new Vector3(0, 1, 0), 1, 1);
    expect(
      getDrawnWaterfalls([
        createWaterfall(new Vector3(0, 0, 0), 0, 1),
        createWaterfall(new Vector3(0, 0, 0), 1, 0),
        fall,
      ]),
    ).toStrictEqual([fall]);
  });

  test("draws a placement the data repeats at the same lip, drop and width once, and keeps falls at other lips", () => {
    expect.hasAssertions();

    const fall = createWaterfall(new Vector3(0, 1, 0), 1, 1);
    const otherFall = createWaterfall(new Vector3(2, 1, 0), 1, 1);
    expect(getDrawnWaterfalls([fall, createWaterfall(new Vector3(0, 1, 0), 1, 1), otherFall])).toStrictEqual([
      fall,
      otherFall,
    ]);
  });
});
