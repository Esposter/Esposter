import { simplifyPath } from "#src/services/genshinAssets/simplifyPath";

// The outline of what a set of triangles covers seen from above, in the game's x and z, for a slab whose every row
// Across it is one run (a walkway, a platform): each row's outermost edges on a grid of `cellSize`, the right edge
// Down and the left edge back up, then simplified by Douglas-Peucker to within `tolerance`
export const fitFootprintOutline = (
  triangles: readonly (readonly [readonly [number, number], readonly [number, number], readonly [number, number]])[],
  { cellSize, tolerance }: { cellSize: number; tolerance: number },
): [number, number][] => {
  const rows = new Map<number, [number, number]>();
  for (const triangle of triangles) {
    const zs = triangle.map(([, z]) => z);
    const firstRow = Math.ceil(Math.min(...zs) / cellSize);
    const lastRow = Math.floor(Math.max(...zs) / cellSize);
    for (let row = firstRow; row <= lastRow; row++) {
      const z = row * cellSize;
      // Where the row's line crosses each edge of the triangle
      const crossings: number[] = [];
      for (let index = 0; index < 3; index++) {
        const [ax, az] = triangle[index] ?? [0, 0];
        const [bx, bz] = triangle[(index + 1) % 3] ?? [0, 0];
        if ((az - z) * (bz - z) > 0 || az === bz) continue;
        crossings.push(ax + ((z - az) / (bz - az)) * (bx - ax));
      }
      if (crossings.length === 0) continue;
      const [left, right] = rows.get(row) ?? [Infinity, -Infinity];
      rows.set(row, [Math.min(left, ...crossings), Math.max(right, ...crossings)]);
    }
  }
  const ordered = [...rows.entries()].toSorted(([a], [b]) => a - b);
  const outline: [number, number][] = [
    ...ordered.map(([row, [, right]]): [number, number] => [right, row * cellSize]),
    ...ordered.toReversed().map(([row, [left]]): [number, number] => [left, row * cellSize]),
  ];
  return simplifyPath(outline, tolerance);
};
