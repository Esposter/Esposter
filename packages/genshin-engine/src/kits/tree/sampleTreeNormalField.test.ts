import { sampleTreeNormalField } from "#src/kits/tree/sampleTreeNormalField";
import { describe, expect, test } from "vitest";

describe(sampleTreeNormalField, () => {
  // Two cells along x, the first's normal up and the second's along x
  const field = { cellSize: 4, normals: [0, 1, 0, 1, 0, 0], origin: [0, 0, 0], size: [2, 1, 1] };

  test("gives a cell's own normal at its centre", () => {
    expect.hasAssertions();

    expect(sampleTreeNormalField(field, [2, 2, 2])).toStrictEqual([0, 1, 0]);
    expect(sampleTreeNormalField(field, [6, 2, 2])).toStrictEqual([1, 0, 0]);
  });
});
