import { simplifyPath } from "#src/services/genshinAssets/fit/simplifyPath";

// How far inside a slab's first and last edge its end rows are read, so a row along an edge still crosses the slab
const END_INSET = 1e-4;
// The outline of what a set of triangles covers seen from above, in the game's x and z, for a slab whose every row
// Across it is one run (a walkway, a platform): each row's outermost edges on a grid of `cellSize`, and at the slab's
// Own first and last edge, the right edge down and the left edge back up, then simplified by Douglas-Peucker to within
// `tolerance`. Its ends are its own rather than the grid's, so slabs laid end to end meet: on the grid alone each lost
// Up to a cell at either end, and the gaps between them opened onto their sides
export const fitFootprintOutline = (
  triangles: readonly (readonly [readonly [number, number], readonly [number, number], readonly [number, number]])[],
  { cellSize, tolerance }: { cellSize: number; tolerance: number },
): [number, number][] => {
  let first = Infinity;
  let last = -Infinity;
  for (const triangle of triangles)
    for (const [, z] of triangle) {
      first = Math.min(first, z);
      last = Math.max(last, z);
    }
  // Each row's outermost edges by the z it is drawn at
  const rows = new Map<number, [number, number]>();
  const readRow = (z: number, drawnZ: number): void => {
    for (const triangle of triangles) {
      // Where the row's line crosses each edge of the triangle
      const crossings: number[] = [];
      for (let index = 0; index < 3; index++) {
        const [ax, az] = triangle[index] ?? [0, 0];
        const [bx, bz] = triangle[(index + 1) % 3] ?? [0, 0];
        if ((az - z) * (bz - z) > 0 || az === bz) continue;
        crossings.push(ax + ((z - az) / (bz - az)) * (bx - ax));
      }
      if (crossings.length === 0) continue;
      const [left, right] = rows.get(drawnZ) ?? [Infinity, -Infinity];
      rows.set(drawnZ, [Math.min(left, ...crossings), Math.max(right, ...crossings)]);
    }
  };
  readRow(first + END_INSET, first);
  for (let row = Math.ceil(first / cellSize); row * cellSize < last; row++)
    if (row * cellSize > first) readRow(row * cellSize, row * cellSize);
  readRow(last - END_INSET, last);
  const ordered = [...rows.entries()].toSorted(([a], [b]) => a - b);
  const outline: [number, number][] = [
    ...ordered.map(([z, [, right]]): [number, number] => [right, z]),
    ...ordered.toReversed().map(([z, [left]]): [number, number] => [left, z]),
  ];
  return simplifyPath(outline, tolerance);
};
