import { getScreenDirection } from "#src/renderer/getScreenDirection";
import { describe, expect, test } from "vitest";

describe(getScreenDirection, () => {
  const camera = { aspect: 2, fov: 90, pitch: 0 };

  test("looks along the camera's forward at the screen's middle, and out to its edges' angles at its corners", () => {
    expect.hasAssertions();

    const middle = getScreenDirection(camera, [0.5, 0.5]);
    const topRight = getScreenDirection(camera, [1, 0]);

    expect(middle.toArray()).toStrictEqual([0, 0, -1]);
    // A 90 degree field is one unit up per unit ahead at the top edge, and twice that across for twice the width
    expect(topRight.x / -topRight.z).toBeCloseTo(2);
    expect(topRight.y / -topRight.z).toBeCloseTo(1);
  });

  test("tilts with the camera's pitch", () => {
    expect.hasAssertions();

    const { y, z } = getScreenDirection({ ...camera, pitch: -Math.PI / 2 }, [0.5, 0.5]);

    expect(y).toBeCloseTo(-1);
    expect(z).toBeCloseTo(0);
  });
});
