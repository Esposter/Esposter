import { writeTreeNormalField } from "#src/kits/tree/writeTreeNormalField";
import { describe, expect, test } from "vitest";

describe(writeTreeNormalField, () => {
  // Two cells along x, the first's normal up and the second's along x
  const field = { cellSize: 4, normals: [0, 1, 0, 1, 0, 0], origin: [0, 0, 0], size: [2, 1, 1] };

  test("writes a cell's own normal at its centre", () => {
    expect.hasAssertions();

    const normal = new Float64Array(3);

    expect(writeTreeNormalField(normal, 0, field, 2, 2, 2)).toBe(true);
    expect([...normal]).toStrictEqual([0, 1, 0]);
    expect(writeTreeNormalField(normal, 0, field, 6, 2, 2)).toBe(true);
    expect([...normal]).toStrictEqual([1, 0, 0]);
  });

  test("writes nothing where the blend of its normals is nothing", () => {
    expect.hasAssertions();

    const normal = new Float64Array([7, 7, 7]);

    expect(writeTreeNormalField(normal, 0, { ...field, normals: [0, 0, 0, 0, 0, 0] }, 2, 2, 2)).toBe(false);
    expect([...normal]).toStrictEqual([7, 7, 7]);
  });
});
