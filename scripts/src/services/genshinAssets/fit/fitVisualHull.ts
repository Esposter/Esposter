import { coverTriangles } from "#src/services/genshinAssets/fit/coverTriangles";

type Point = readonly [number, number];
// The three axis views a hull is carved from, each as the two axes its plane spans
const VIEW_AXES = [
  [0, 1],
  [2, 1],
  [0, 2],
] as const;
// A mesh as boxes, each [minX, minY, minZ, maxX, maxY, maxZ]: its visual hull from its three axis views, solid only
// Where all three cover, so an opening seen from any side (an arch, the space under a deck) stays open through the
// Whole part where one view's outline extruded through its depth would fill it. Each view is its triangles' covered
// Cells on a grid of `cellSize`, with the cells their edges cross too, so a face seen edge-on still covers, and the
// Solid cells are merged greedily into boxes along x, then y, then z
export const fitVisualHull = (
  {
    faces,
    vertices,
  }: {
    faces: readonly (readonly [number, number, number])[];
    vertices: readonly (readonly [number, number, number])[];
  },
  cellSize: number,
): [number, number, number, number, number, number][] => {
  const minimum = [0, 1, 2].map((axis) => Math.min(...vertices.map((vertex) => vertex[axis] ?? 0)));
  const counts = [0, 1, 2].map(
    (axis) =>
      Math.ceil((Math.max(...vertices.map((vertex) => vertex[axis] ?? 0)) - (minimum[axis] ?? 0)) / cellSize) + 1,
  );
  const [countX = 0, countY = 0, countZ = 0] = counts;
  const views = VIEW_AXES.map(([across, up]) => {
    const width = counts[across] ?? 0;
    const height = counts[up] ?? 0;
    const corner: Point = [minimum[across] ?? 0, minimum[up] ?? 0];
    const project = (index: number): Point => {
      const vertex = vertices[index];
      return [vertex?.[across] ?? 0, vertex?.[up] ?? 0];
    };
    const triangles = faces.map(([a, b, c]) => [project(a), project(b), project(c)] as const);
    const covered = coverTriangles(triangles, { cellSize, corner, height, width });
    for (const triangle of triangles)
      for (const [index, start] of triangle.entries()) {
        const end = triangle[(index + 1) % 3] ?? start;
        const steps = Math.ceil((Math.hypot(end[0] - start[0], end[1] - start[1]) / cellSize) * 2) + 1;
        for (let step = 0; step <= steps; step++) {
          const column = Math.floor((start[0] + ((end[0] - start[0]) * step) / steps - corner[0]) / cellSize);
          const row = Math.floor((start[1] + ((end[1] - start[1]) * step) / steps - corner[1]) / cellSize);
          if (column >= 0 && row >= 0 && column < width && row < height) covered[row * width + column] = 1;
        }
      }
    return { covered, width };
  });
  const [front, side, plan] = views;
  const checkIsSolid = (x: number, y: number, z: number): boolean =>
    Boolean(
      front?.covered[y * front.width + x] && side?.covered[y * side.width + z] && plan?.covered[z * plan.width + x],
    );
  const visited = new Uint8Array(countX * countY * countZ);
  const checkIsFree = (x: number, y: number, z: number): boolean =>
    visited[(z * countY + y) * countX + x] === 0 && checkIsSolid(x, y, z);
  const boxes: [number, number, number, number, number, number][] = [];
  for (let z = 0; z < countZ; z++)
    for (let y = 0; y < countY; y++)
      for (let x = 0; x < countX; x++) {
        if (!checkIsFree(x, y, z)) continue;
        let endX = x + 1;
        while (endX < countX && checkIsFree(endX, y, z)) endX++;
        const checkIsRowFree = (rowY: number, rowZ: number): boolean => {
          for (let column = x; column < endX; column++) if (!checkIsFree(column, rowY, rowZ)) return false;
          return true;
        };
        let endY = y + 1;
        while (endY < countY && checkIsRowFree(endY, z)) endY++;
        let endZ = z + 1;
        const checkIsLayerFree = (layerZ: number): boolean => {
          for (let row = y; row < endY; row++) if (!checkIsRowFree(row, layerZ)) return false;
          return true;
        };
        while (endZ < countZ && checkIsLayerFree(endZ)) endZ++;
        for (let boxZ = z; boxZ < endZ; boxZ++)
          for (let boxY = y; boxY < endY; boxY++)
            for (let boxX = x; boxX < endX; boxX++) visited[(boxZ * countY + boxY) * countX + boxX] = 1;
        const [originX = 0, originY = 0, originZ = 0] = minimum;
        boxes.push([
          originX + x * cellSize,
          originY + y * cellSize,
          originZ + z * cellSize,
          originX + endX * cellSize,
          originY + endY * cellSize,
          originZ + endZ * cellSize,
        ]);
      }
  return boxes;
};
