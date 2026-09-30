import { traceCoveredGrid } from "#src/services/genshinAssets/traceCoveredGrid";

// What a set of triangles covers in one plane, as every loop round it: the covered cells of a grid of `cellSize`,
// Each loop walked along their edges with the covered side on its left, so an outer ring runs counterclockwise and a
// Hole clockwise, then simplified by Douglas-Peucker to within `tolerance`. A bridge's arches are its holes
export const fitSilhouette = (
  triangles: readonly (readonly [readonly [number, number], readonly [number, number], readonly [number, number]])[],
  { cellSize, tolerance }: { cellSize: number; tolerance: number },
): [number, number][][] => {
  const points = triangles.flat();
  const minX = Math.min(...points.map(([x]) => x));
  const minY = Math.min(...points.map(([, y]) => y));
  const width = Math.ceil((Math.max(...points.map(([x]) => x)) - minX) / cellSize) + 1;
  const height = Math.ceil((Math.max(...points.map(([, y]) => y)) - minY) / cellSize) + 1;
  const covered = new Uint8Array(width * height);
  for (const [a, b, c] of triangles) {
    const toCell = ([x, y]: readonly [number, number]): [number, number] => [
      (x - minX) / cellSize,
      (y - minY) / cellSize,
    ];
    const [[ax, ay], [bx, by], [cx, cy]] = [toCell(a), toCell(b), toCell(c)];
    const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (area === 0) continue;
    for (let row = Math.floor(Math.min(ay, by, cy)); row <= Math.ceil(Math.max(ay, by, cy)); row++)
      for (let column = Math.floor(Math.min(ax, bx, cx)); column <= Math.ceil(Math.max(ax, bx, cx)); column++) {
        // A cell is covered where its middle falls inside the triangle, on the same side of each edge
        const [px, py] = [column + 0.5, row + 0.5];
        const first = ((bx - ax) * (py - ay) - (by - ay) * (px - ax)) * area;
        const second = ((cx - bx) * (py - by) - (cy - by) * (px - bx)) * area;
        const third = ((ax - cx) * (py - cy) - (ay - cy) * (px - cx)) * area;
        if (first >= 0 && second >= 0 && third >= 0 && column >= 0 && row >= 0 && column < width && row < height)
          covered[row * width + column] = 1;
      }
  }
  return traceCoveredGrid(covered, { height, tolerance: tolerance / cellSize, width }).map((loop) =>
    loop.map(([x, y]): [number, number] => [minX + x * cellSize, minY + y * cellSize]),
  );
};
