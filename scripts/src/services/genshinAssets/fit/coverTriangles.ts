// The cells of a grid that triangles in its plane cover, one byte a cell, row by row: a cell is covered where its
// Middle falls inside a triangle, on the same side of each of its edges. The grid starts at its corner and runs `width`
// Cells across and `height` up, each `cellSize` wide
export const coverTriangles = (
  triangles: readonly (readonly [readonly [number, number], readonly [number, number], readonly [number, number]])[],
  {
    cellSize,
    corner: [minX, minY],
    height,
    width,
  }: { cellSize: number; corner: readonly [number, number]; height: number; width: number },
): Uint8Array => {
  const covered = new Uint8Array(width * height);
  const toCell = ([x, y]: readonly [number, number]): [number, number] => [
    (x - minX) / cellSize,
    (y - minY) / cellSize,
  ];
  for (const [a, b, c] of triangles) {
    const [[ax, ay], [bx, by], [cx, cy]] = [toCell(a), toCell(b), toCell(c)];
    const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (area === 0) continue;
    for (
      let row = Math.max(Math.floor(Math.min(ay, by, cy)), 0);
      row <= Math.min(Math.ceil(Math.max(ay, by, cy)), height - 1);
      row++
    )
      for (
        let column = Math.max(Math.floor(Math.min(ax, bx, cx)), 0);
        column <= Math.min(Math.ceil(Math.max(ax, bx, cx)), width - 1);
        column++
      ) {
        const [px, py] = [column + 0.5, row + 0.5];
        const first = ((bx - ax) * (py - ay) - (by - ay) * (px - ax)) * area;
        const second = ((cx - bx) * (py - by) - (cy - by) * (px - bx)) * area;
        const third = ((ax - cx) * (py - cy) - (ay - cy) * (px - cx)) * area;
        if (first >= 0 && second >= 0 && third >= 0) covered[row * width + column] = 1;
      }
  }
  return covered;
};
