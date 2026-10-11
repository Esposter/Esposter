// The bilinear blend of a grid's four nodes round a point, read row by row along z from the point's column and row, which
// The caller has already kept to the grid's edges
export const blendGridNodes = (
  values: readonly number[],
  sizeX: number,
  sizeZ: number,
  column: number,
  row: number,
): number => {
  const left = Math.floor(column);
  const near = Math.floor(row);
  const right = Math.min(left + 1, sizeX - 1);
  const far = Math.min(near + 1, sizeZ - 1);
  const across = column - left;
  const along = row - near;
  return (
    ((values[near * sizeX + left] ?? 0) * (1 - across) + (values[near * sizeX + right] ?? 0) * across) * (1 - along) +
    ((values[far * sizeX + left] ?? 0) * (1 - across) + (values[far * sizeX + right] ?? 0) * across) * along
  );
};
