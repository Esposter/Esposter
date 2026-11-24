// The high-pass of a family's normal angles: each pixel's angle less the mean of the family's angles within a box of
// `radius` pixels round it, so a variation longer than the box is taken as shape and removed, and a shorter one stays.
// A pixel outside the family is NaN, and it counts toward no mean. Summed-area tables make the box mean cost one lookup
export const highPassAngles = (angles: Float64Array, width: number, radius: number): Float64Array => {
  const height = angles.length / width;
  const stride = width + 1;
  const sums = new Float64Array(stride * (height + 1));
  const counts = new Float64Array(stride * (height + 1));
  const tableAt = (table: Float64Array, column: number, row: number): number => table[row * stride + column] ?? 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const angle = angles[y * width + x] ?? Number.NaN;
      const valid = Number.isNaN(angle) ? 0 : 1;
      const at = (y + 1) * stride + x + 1;
      sums[at] = (sums[at - stride] ?? 0) + (sums[at - 1] ?? 0) - (sums[at - stride - 1] ?? 0) + (valid ? angle : 0);
      counts[at] = (counts[at - stride] ?? 0) + (counts[at - 1] ?? 0) - (counts[at - stride - 1] ?? 0) + valid;
    }
  // The sum or count of the box from (x0, y0) up to, not including, (x1, y1)
  const boxTotal = (table: Float64Array, x0: number, y0: number, x1: number, y1: number): number =>
    tableAt(table, x1, y1) - tableAt(table, x0, y1) - tableAt(table, x1, y0) + tableAt(table, x0, y0);
  const result = new Float64Array(angles.length);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const angle = angles[y * width + x] ?? Number.NaN;
      if (Number.isNaN(angle)) {
        result[y * width + x] = Number.NaN;
        continue;
      }
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(width, x + radius + 1);
      const y0 = Math.max(0, y - radius);
      const y1 = Math.min(height, y + radius + 1);
      result[y * width + x] = angle - boxTotal(sums, x0, y0, x1, y1) / boxTotal(counts, x0, y0, x1, y1);
    }
  return result;
};
