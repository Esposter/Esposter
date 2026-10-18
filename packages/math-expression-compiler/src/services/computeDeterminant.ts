// The determinant of a list read as a matrix of one element, which is that element, and of the empty matrix, which is one
export const computeDeterminant = (values: readonly number[]): null | number => {
  if (values.length === 0) return 1;
  return values.length === 1 ? (values[0] ?? null) : null;
};
