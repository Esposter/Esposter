import { fitVisualHull } from "#src/services/genshinAssets/fit/fitVisualHull";
import { describe, expect, test } from "vitest";

type Mesh = Parameters<typeof fitVisualHull>[0];

// A cuboid's twelve triangles, appended to a mesh
const addCuboid = (
  { faces, vertices }: { faces: [number, number, number][]; vertices: [number, number, number][] },
  [minX, minY, minZ]: [number, number, number],
  [maxX, maxY, maxZ]: [number, number, number],
): void => {
  const start = vertices.length;
  for (const z of [minZ, maxZ]) for (const y of [minY, maxY]) for (const x of [minX, maxX]) vertices.push([x, y, z]);
  const quads = [
    [0, 1, 3, 2],
    [4, 6, 7, 5],
    [0, 4, 5, 1],
    [2, 3, 7, 6],
    [0, 2, 6, 4],
    [1, 5, 7, 3],
  ];
  for (const [a = 0, b = 0, c = 0, d = 0] of quads)
    faces.push([start + a, start + b, start + c], [start + a, start + c, start + d]);
};
const checkIsInside = (boxes: ReturnType<typeof fitVisualHull>, [x, y, z]: [number, number, number]): boolean =>
  boxes.some(
    ([minX, minY, minZ, maxX, maxY, maxZ]) => x > minX && x < maxX && y > minY && y < maxY && z > minZ && z < maxZ,
  );

describe(fitVisualHull, () => {
  test("keeps an arch's opening open through its whole length, and its piers and deck solid", () => {
    expect.hasAssertions();

    const arch: Mesh & { faces: [number, number, number][]; vertices: [number, number, number][] } = {
      faces: [],
      vertices: [],
    };
    addCuboid(arch, [0, 0, 0], [1, 3, 10]);
    addCuboid(arch, [3, 0, 0], [4, 3, 10]);
    addCuboid(arch, [0, 3, 0], [4, 4, 10]);
    const boxes = fitVisualHull(arch, 0.5);

    expect(checkIsInside(boxes, [2, 1, 5])).toBe(false);
    expect(checkIsInside(boxes, [0.5, 1, 5])).toBe(true);
    expect(checkIsInside(boxes, [2, 3.5, 5])).toBe(true);
    expect(boxes.length).toBeLessThan(10);
  });
});
