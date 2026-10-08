import { solveSimilarity } from "#src/services/genshinAssets/points/solveSimilarity";
import { describe, expect, test } from "vitest";

describe(solveSimilarity, () => {
  test("recovers the scale, turn and offset of the pairs it is given", () => {
    expect.hasAssertions();
    // A scale of two, a quarter turn and an offset of (3, -4) carry (1, 0) to (3, -2) and (0, 1) to (1, -4)
    const transform = solveSimilarity(
      [
        { from: { x: 1, z: 0 }, to: { x: 3, z: -2 } },
        { from: { x: 0, z: 1 }, to: { x: 1, z: -4 } },
      ],
      false,
    );
    expect(transform.scale).toBeCloseTo(2);
    expect(transform.turn).toBeCloseTo(Math.PI / 2);
    expect(transform.offset.x).toBeCloseTo(3);
    expect(transform.offset.z).toBeCloseTo(-4);
  });

  test("mirrors the source across the x axis before it solves when asked", () => {
    expect.hasAssertions();
    const transform = solveSimilarity(
      [
        { from: { x: 1, z: 2 }, to: { x: 1, z: -2 } },
        { from: { x: 3, z: 1 }, to: { x: 3, z: -1 } },
        { from: { x: 0, z: 4 }, to: { x: 0, z: -4 } },
      ],
      true,
    );
    expect(transform.mirrored).toBe(true);
    expect(transform.scale).toBeCloseTo(1);
    expect(transform.turn).toBeCloseTo(0);
    expect(transform.offset.x).toBeCloseTo(0);
    expect(transform.offset.z).toBeCloseTo(0);
  });
});
