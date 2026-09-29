import { computeSunDirection } from "#src/atmosphere/computeSunDirection";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(computeSunDirection, () => {
  test("rises due east at six and stands overhead at noon with no tilt", () => {
    expect.hasAssertions();

    const { x } = computeSunDirection(360, 0, new Vector3());
    const { y } = computeSunDirection(720, 0, new Vector3());

    expect({ x, y }).toStrictEqual({ x: 1, y: 1 });
  });
});
