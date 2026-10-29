// The ink of each row and each column of a luminance grid: the sum of its pixels' distance from the grid's mean luminance,
// So a row or column that is drawn over what the rest of the rectangle is shows as the largest sum
export const getInkProfiles = (
  luminance: Float64Array,
  width: number,
  height: number,
): { columnInk: number[]; rowInk: number[] } => {
  let total = 0;
  for (const value of luminance) total += value;
  const mean = total / Math.max(luminance.length, 1);
  const columnInk = Array.from({ length: width }, () => 0);
  const rowInk = Array.from({ length: height }, () => 0);
  for (let row = 0; row < height; row++)
    for (let column = 0; column < width; column++) {
      const distance = Math.abs((luminance[row * width + column] ?? 0) - mean);
      rowInk[row] = (rowInk[row] ?? 0) + distance;
      columnInk[column] = (columnInk[column] ?? 0) + distance;
    }
  return { columnInk, rowInk };
};
