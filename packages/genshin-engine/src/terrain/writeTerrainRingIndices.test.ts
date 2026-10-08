import { writeTerrainRingIndices } from "#src/terrain/writeTerrainRingIndices";
import { describe, expect, test } from "vitest";

const VERTEX_COUNT = 4;

describe(writeTerrainRingIndices, () => {
  test("numbers each drawn tile's indices from its place in the ring", () => {
    expect.hasAssertions();

    const ringIndices = new Uint32Array(6);
    const count = writeTerrainRingIndices(ringIndices, new Uint16Array([0, 1, 2]), [0, 2], VERTEX_COUNT);

    expect(count).toBe(6);
    expect(ringIndices).toStrictEqual(new Uint32Array([0, 1, 2, 8, 9, 10]));
  });
});
