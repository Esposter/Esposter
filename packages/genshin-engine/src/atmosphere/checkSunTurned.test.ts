import { checkSunTurned } from "#src/atmosphere/checkSunTurned";
import { MathUtils, Vector3 } from "three";
import { describe, expect, test } from "vitest";

const DRAWN_DIRECTION = new Vector3(0, 1, 0);

// A unit direction turned this many degrees about the z axis from the drawn one
const getDirectionAt = (degrees: number): Vector3 =>
  new Vector3(Math.sin(MathUtils.degToRad(degrees)), Math.cos(MathUtils.degToRad(degrees)), 0);

describe(checkSunTurned, () => {
  test("keeps the drawn direction while the sun has not turned past the threshold", () => {
    expect.hasAssertions();

    expect(checkSunTurned(DRAWN_DIRECTION, getDirectionAt(0.3))).toBe(false);
  });

  test("redraws once the sun has turned past the threshold", () => {
    expect.hasAssertions();

    expect(checkSunTurned(DRAWN_DIRECTION, getDirectionAt(1))).toBe(true);
  });

  test("redraws a direction with no length, a light still standing on its target", () => {
    expect.hasAssertions();

    expect(checkSunTurned(new Vector3(), DRAWN_DIRECTION)).toBe(true);
  });
});
