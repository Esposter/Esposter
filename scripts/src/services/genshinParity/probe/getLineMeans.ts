// The mean luminance of each row and each column of a luminance grid, the profiles an edge is read along
export const getLineMeans = (
  luminance: Float64Array,
  width: number,
  height: number,
): { columns: number[]; rows: number[] } => {
  const rows = Array.from({ length: height }, () => 0);
  const columns = Array.from({ length: width }, () => 0);
  for (let row = 0; row < height; row++)
    for (let column = 0; column < width; column++) {
      const value = luminance[row * width + column] ?? 0;
      rows[row] = (rows[row] ?? 0) + value / width;
      columns[column] = (columns[column] ?? 0) + value / height;
    }
  return { columns, rows };
};
