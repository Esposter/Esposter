// The faces of meshes that look up, drawn from above into a grid of cells, each cell keeping the face standing
// Highest over its middle: that face's value at the cell, interpolated across it from its corners' (a texture's
// Coordinates), and its tag (the material it draws with). The grid starts at its corner and runs `width` cells along x
// And `height` along the plane's second axis, each `cellSize` wide; a cell no face covers keeps the tag -1
export const rasterizeTopFaces = (
  faces: readonly {
    corners: readonly (readonly [number, number, number])[];
    tag: number;
    values: readonly (readonly [number, number])[];
  }[],
  {
    cellSize,
    corner: [minX, minY],
    height,
    width,
  }: { cellSize: number; corner: readonly [number, number]; height: number; width: number },
): { heights: Float32Array; tags: Int16Array; values: Float32Array } => {
  const tags = new Int16Array(width * height).fill(-1);
  const heights = new Float32Array(width * height).fill(-Infinity);
  const values = new Float32Array(width * height * 2);
  for (const { corners, tag, values: cornerValues } of faces) {
    const [a, b, c] = corners;
    const [aValue, bValue, cValue] = cornerValues;
    if (!a || !b || !c || !aValue || !bValue || !cValue) continue;
    // Each corner in cells, its plane's two axes the first and third of its three
    const [ax, ay] = [(a[0] - minX) / cellSize, (a[2] - minY) / cellSize];
    const [bx, by] = [(b[0] - minX) / cellSize, (b[2] - minY) / cellSize];
    const [cx, cy] = [(c[0] - minX) / cellSize, (c[2] - minY) / cellSize];
    const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (area === 0) continue;
    const firstColumn = Math.max(Math.floor(Math.min(ax, bx, cx)), 0);
    const lastColumn = Math.min(Math.ceil(Math.max(ax, bx, cx)), width - 1);
    const firstRow = Math.max(Math.floor(Math.min(ay, by, cy)), 0);
    const lastRow = Math.min(Math.ceil(Math.max(ay, by, cy)), height - 1);
    for (let row = firstRow; row <= lastRow; row++)
      for (let column = firstColumn; column <= lastColumn; column++) {
        const [px, py] = [column + 0.5, row + 0.5];
        const aWeight = ((bx - px) * (cy - py) - (by - py) * (cx - px)) / area;
        const bWeight = ((cx - px) * (ay - py) - (cy - py) * (ax - px)) / area;
        const cWeight = 1 - aWeight - bWeight;
        if (aWeight < 0 || bWeight < 0 || cWeight < 0) continue;
        const cell = row * width + column;
        const cellHeight = aWeight * a[1] + bWeight * b[1] + cWeight * c[1];
        if (cellHeight <= (heights[cell] ?? -Infinity)) continue;
        heights[cell] = cellHeight;
        tags[cell] = tag;
        values[cell * 2] = aWeight * aValue[0] + bWeight * bValue[0] + cWeight * cValue[0];
        values[cell * 2 + 1] = aWeight * aValue[1] + bWeight * bValue[1] + cWeight * cValue[1];
      }
  }
  return { heights, tags, values };
};
