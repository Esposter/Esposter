import { computePointToLine2D } from "#src/services/function/computePointToLine2D";
import { computePointToLine3D } from "#src/services/function/computePointToLine3D";

export const computeDistance = (point: number[], other: number[]): null | number => {
  if (point.length === 2 && other.length === 3) return computePointToLine2D(point, other);
  if (point.length === 3 && other.length === 6) return computePointToLine3D(point, other);
  if (point.length !== other.length || point.length === 0) return null;

  let total = 0;
  for (const [index, value] of point.entries()) {
    const difference = value - (other[index] ?? Number.NaN);
    total = difference * difference + total;
  }
  return Math.sqrt(total);
};
