// The normal equations of a least-squares fit: each row's weighted outer product summed into the matrix on the left, and
// each row's target summed into the vector on the right. A row's zero entry adds nothing, so it is passed over
export const accumulateNormalEquations = (
  rows: readonly { row: readonly number[]; target: number; weight: number }[],
  unknownCount: number,
): { gram: number[][]; right: number[] } => {
  const gram = Array.from({ length: unknownCount }, () => Array.from({ length: unknownCount }, () => 0));
  const right = Array.from({ length: unknownCount }, () => 0);
  for (const { row, target, weight } of rows)
    for (const [first, firstValue] of row.entries()) {
      if (firstValue === 0) continue;
      right[first] = (right[first] ?? 0) + weight * firstValue * target;
      const gramRow = gram[first] ?? [];
      for (const [second, secondValue] of row.entries())
        gramRow[second] = (gramRow[second] ?? 0) + weight * firstValue * secondValue;
    }
  return { gram, right };
};
