import { getPlaceGroundHeight } from "#src/services/world/getPlaceGroundHeight";
import { describe, expect, test } from "vitest";

const outline = [
  { x: 0, z: 0 },
  { x: 10, z: 0 },
  { x: 10, z: 10 },
  { x: 0, z: 10 },
];
const getGroundHeight = (x: number, z: number) => x + z;

describe(getPlaceGroundHeight, () => {
  test("a fitted place stands on the ground beneath it", () => {
    expect.hasAssertions();

    expect(getPlaceGroundHeight({ x: 5, z: 4 }, [outline], getGroundHeight)).toBe(9);
  });

  test("a place whose ground cannot be found is reported", () => {
    expect.hasAssertions();

    expect(getPlaceGroundHeight({ x: 20, z: 4 }, [outline], getGroundHeight)).toBeUndefined();
  });
});
