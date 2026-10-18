export const computeGreatestCommonDivisor = (left: number, right: number): number =>
  right === 0 ? Math.abs(left) : computeGreatestCommonDivisor(right, left % right);
