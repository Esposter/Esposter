import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

import { computeMapFrameTransform } from "#src/services/map/computeMapFrameTransform";
import { projectMapPoint } from "#src/services/map/projectMapPoint";

describe(computeMapFrameTransform, () => {
  const centre = { x: -1094.6, z: -2699.7 };

  test("places a catalogue point where projectMapPoint does", () => {
    expect.hasAssertions();

    const point = { x: centre.x - 80, z: centre.z + 41 };
    const values = computeMapFrameTransform(centre).slice("matrix(".length, -1).split(" ").map(Number);
    const a = takeOne(values, 0);
    const b = takeOne(values, 1);
    const c = takeOne(values, 2);
    const d = takeOne(values, 3);
    const e = takeOne(values, 4);
    const f = takeOne(values, 5);

    expect({ x: a * point.x + c * point.z + e, y: b * point.x + d * point.z + f }).toStrictEqual(
      projectMapPoint(point, centre),
    );
  });
});
