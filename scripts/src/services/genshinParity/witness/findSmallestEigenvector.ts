import { computeSymmetricEigen } from "#src/services/shared/computeSymmetricEigen";

// The eigenvector of a symmetric matrix belonging to its smallest eigenvalue: what least squares takes for the null
// Space of a homogeneous system
export const findSmallestEigenvector = (symmetric: readonly number[][]): number[] => {
  const { values, vectors } = computeSymmetricEigen(symmetric);
  let smallest = 0;
  for (let index = 1; index < values.length; index++)
    if ((values[index] ?? 0) < (values[smallest] ?? 0)) smallest = index;
  return vectors[smallest] ?? [];
};
