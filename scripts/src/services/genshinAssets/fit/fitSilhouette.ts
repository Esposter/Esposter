import { coverTriangles } from "#src/services/genshinAssets/fit/coverTriangles";
import { traceCoveredGrid } from "#src/services/genshinAssets/fit/traceCoveredGrid";

// What a set of triangles covers in one plane, as every loop round it: the covered cells of a grid of `cellSize`,
// Each loop walked along their edges with the covered side on its left, so an outer ring runs counterclockwise and a
// Hole clockwise, then simplified by Douglas-Peucker to within `tolerance`. A cloud's gaps are its holes
export const fitSilhouette = (
  triangles: readonly (readonly [readonly [number, number], readonly [number, number], readonly [number, number]])[],
  { cellSize, tolerance }: { cellSize: number; tolerance: number },
): [number, number][][] => {
  const points = triangles.flat();
  const minX = Math.min(...points.map(([x]) => x));
  const minY = Math.min(...points.map(([, y]) => y));
  const width = Math.ceil((Math.max(...points.map(([x]) => x)) - minX) / cellSize) + 1;
  const height = Math.ceil((Math.max(...points.map(([, y]) => y)) - minY) / cellSize) + 1;
  const covered = coverTriangles(triangles, { cellSize, corner: [minX, minY], height, width });
  return traceCoveredGrid(covered, { height, tolerance: tolerance / cellSize, width }).map((loop) =>
    loop.map(([x, y]): [number, number] => [minX + x * cellSize, minY + y * cellSize]),
  );
};
