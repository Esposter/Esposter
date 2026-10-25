import type { Vector } from "#src/models/shared/Vector";

import { computeSymmetricEigen } from "#src/services/shared/computeSymmetricEigen";
import { Vector3 } from "three";

// Points' spread along each of their principal axes: their centroid, and the axes their covariance's eigenvectors
// Point along, from the greatest spread to the least
export const computePrincipalAxes = (points: readonly Vector[]): { axes: Vector3[]; centroid: Vector3 } => {
  const centroid = points
    .reduce((sum, point) => sum.add(new Vector3(...point)), new Vector3())
    .divideScalar(points.length);
  const covariance = [0, 1, 2].map((row) =>
    [0, 1, 2].map(
      (column) =>
        points.reduce(
          (sum, point) =>
            sum +
            ((point[row] ?? 0) - centroid.getComponent(row)) * ((point[column] ?? 0) - centroid.getComponent(column)),
          0,
        ) / points.length,
    ),
  );
  const { values, vectors } = computeSymmetricEigen(covariance);
  const axes = [0, 1, 2]
    .toSorted((firstAxis, secondAxis) => (values[secondAxis] ?? 0) - (values[firstAxis] ?? 0))
    .map((index) => new Vector3(...(vectors[index] ?? [0, 0, 0])).normalize());
  return { axes, centroid };
};
