// The pixel within a radius of the one given where a grey image has its strongest corner, by the Shi-Tomasi measure:
// The smaller eigenvalue of the gradients' structure tensor summed over a pixel's three by three neighbourhood, large
// Only where the image turns in two directions at once. A pixel read by eye off a reference lands on the part's own
// Corner this way, rather than a pixel or two beside it
export const snapToCorner = (
  grey: Float32Array,
  width: number,
  height: number,
  [x, y]: readonly [number, number],
  radius: number,
): [number, number] => {
  const at = (column: number, row: number): number =>
    grey[Math.min(Math.max(row, 0), height - 1) * width + Math.min(Math.max(column, 0), width - 1)] ?? 0;
  const readStrength = (column: number, row: number): number => {
    let xx = 0;
    let xy = 0;
    let yy = 0;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const gx = at(column + dx + 1, row + dy) - at(column + dx - 1, row + dy);
        const gy = at(column + dx, row + dy + 1) - at(column + dx, row + dy - 1);
        xx += gx * gx;
        xy += gx * gy;
        yy += gy * gy;
      }
    return (xx + yy) / 2 - Math.hypot((xx - yy) / 2, xy);
  };
  let best: [number, number] = [Math.round(x), Math.round(y)];
  let bestStrength = -Infinity;
  for (let row = Math.round(y) - radius; row <= Math.round(y) + radius; row++)
    for (let column = Math.round(x) - radius; column <= Math.round(x) + radius; column++) {
      if (Math.hypot(column - x, row - y) > radius || column < 0 || row < 0 || column >= width || row >= height)
        continue;
      const strength = readStrength(column, row);
      if (strength > bestStrength) {
        bestStrength = strength;
        best = [column, row];
      }
    }
  return best;
};
