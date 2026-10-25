export const set = (rows: number[][], row: number, column: number, value: number): void => {
  const target = rows[row];
  if (target) target[column] = value;
};
