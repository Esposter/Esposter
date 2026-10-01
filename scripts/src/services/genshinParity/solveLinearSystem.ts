// The solution of a square linear system by Gaussian elimination with partial pivoting, or undefined when the system is
// Singular to working precision
export const solveLinearSystem = (matrix: readonly number[][], vector: readonly number[]): number[] | undefined => {
  const size = vector.length;
  const rows = matrix.map((row, index) => [...row, vector[index] ?? 0]);
  for (let column = 0; column < size; column++) {
    let pivot = column;
    for (let row = column + 1; row < size; row++)
      if (Math.abs(rows[row]?.[column] ?? 0) > Math.abs(rows[pivot]?.[column] ?? 0)) pivot = row;
    const pivotRow = rows[pivot];
    const pivotValue = pivotRow?.[column] ?? 0;
    if (!pivotRow || Math.abs(pivotValue) < Number.EPSILON) return undefined;
    [rows[column], rows[pivot]] = [pivotRow, rows[column] ?? pivotRow];
    for (let row = column + 1; row < size; row++) {
      const target = rows[row];
      if (!target) continue;
      const factor = (target[column] ?? 0) / pivotValue;
      for (let entry = column; entry <= size; entry++)
        target[entry] = (target[entry] ?? 0) - factor * (pivotRow[entry] ?? 0);
    }
  }
  const solution = Array.from({ length: size }, () => 0);
  for (let row = size - 1; row >= 0; row--) {
    const values = rows[row] ?? [];
    let sum = values[size] ?? 0;
    for (let column = row + 1; column < size; column++) sum -= (values[column] ?? 0) * (solution[column] ?? 0);
    solution[row] = sum / (values[row] ?? 1);
  }
  return solution;
};
