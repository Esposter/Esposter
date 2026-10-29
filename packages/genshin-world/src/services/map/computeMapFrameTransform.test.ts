import { computeMapFrameTransform } from "#src/services/map/computeMapFrameTransform";
import { projectMapPoint } from "#src/services/map/projectMapPoint";
import { describe, expect, test } from "vitest";

describe(computeMapFrameTransform, () => {
  const centre = { x: -1094.6, z: -2699.7 };

  test("places a catalogue point where projectMapPoint does", () => {
    expect.hasAssertions();

    const point = { x: centre.x - 80, z: centre.z + 41 };
    const [a, b, c, d, e, f] = computeMapFrameTransform(centre).slice("matrix(".length, -1).split(" ").map(Number);

    expect({ x: a * point.x + c * point.z + e, y: b * point.x + d * point.z + f }).toStrictEqual(
      projectMapPoint(point, centre),
    );
  });
});
