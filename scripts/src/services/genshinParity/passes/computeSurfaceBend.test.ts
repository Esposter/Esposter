import { computeSurfaceBend, getSurfaceBendReading } from "#src/services/genshinParity/passes/computeSurfaceBend";
import { SHAPE_NORMAL_RESOLUTION_DEGREES, SPLIT_BLOCK_PIXELS } from "#src/services/genshinParity/passes/constants";
import { describe, expect, test } from "vitest";

describe(computeSurfaceBend, () => {
  test("reads each side's bend over the pixels both draw, the exports' over each half of its blocks", () => {
    expect.hasAssertions();

    // One row two blocks wide, all of one family: the exports' first block bends nothing, its second turns each normal
    // A right angle off its geometry's; ours bends nothing
    const width = SPLIT_BLOCK_PIXELS * 2;
    const toTarget = (toPixel: (pixel: number) => number[]): Float32Array =>
      Float32Array.from(Array.from({ length: width }, (_value, pixel) => toPixel(pixel)).flat());
    const up = toTarget(() => [0, 1, 0, 1]);
    const side = (normal: Float32Array) => ({ geometryNormal: up, normal, part: toTarget(() => [1, 0, 0, 1]) });

    expect(
      computeSurfaceBend(
        side(toTarget((pixel) => (pixel < SPLIT_BLOCK_PIXELS ? [0, 1, 0, 1] : [0, 0, 1, 1]))),
        side(up),
        width,
        2,
      ),
    ).toStrictEqual([{ exportsAngle: 45, family: 0, halves: [0, 90], oursAngle: 0 }]);
  });

  test("gates ours' bend less the exports' at the floor the exports' halves stand apart by", () => {
    expect.hasAssertions();

    expect(getSurfaceBendReading({ exportsAngle: 45, family: 0, halves: [0, 90], oursAngle: 0 })).toStrictEqual({
      gate: 90,
      value: 45,
    });
    expect(getSurfaceBendReading({ exportsAngle: 10.5, family: 0, halves: [10, 12], oursAngle: 10.5 })).toStrictEqual({
      gate: 2,
      value: 0,
    });
  });

  test("never gates below the normal target's resolution, so float noise on both sides holds", () => {
    expect.hasAssertions();

    expect(getSurfaceBendReading({ exportsAngle: 0, family: 0, halves: [0, 0.0002], oursAngle: 0.0006 })).toStrictEqual(
      { gate: SHAPE_NORMAL_RESOLUTION_DEGREES, value: 0.0006 },
    );
  });

  test("fails a real bend, ours' 10 degrees against the exports' none, at the resolution", () => {
    expect.hasAssertions();

    expect(getSurfaceBendReading({ exportsAngle: 0, family: 0, halves: [0, 0], oursAngle: 10 })).toStrictEqual({
      gate: SHAPE_NORMAL_RESOLUTION_DEGREES,
      value: 10,
    });
  });
});
