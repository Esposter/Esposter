import { computeOutlineDistance } from "#src/world/computeOutlineDistance";
import { describe, expect, test } from "vitest";

describe(computeOutlineDistance, () => {
  const square = [
    { x: 0, z: 0 },
    { x: 2, z: 0 },
    { x: 2, z: 2 },
    { x: 0, z: 2 },
  ];

  test("is zero inside, the distance to the nearest edge outside, and infinite with no outline", () => {
    expect.hasAssertions();

    expect({
      inside: computeOutlineDistance(square, 1, 1),
      outside: computeOutlineDistance(square, 5, 1),
      undrawn: computeOutlineDistance([], 0, 0),
    }).toStrictEqual({ inside: 0, outside: 3, undrawn: Infinity });
  });
});
