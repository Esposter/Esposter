// The nth root as mathjs takes it: a negative root is the reciprocal of the root of the magnitude, a negative value needs an
// Odd integer root, and a root that is exact for a perfect power is that power's root rather than its rounding residue
export const computeNthRoot = (value: number, root: number): null | number => {
  const isInverse = root < 0;
  const degree = Math.abs(root);
  if (degree === 0) return null;
  if (value < 0 && degree % 2 !== 1) return null;
  if (value === 0) return isInverse ? Number.POSITIVE_INFINITY : 0;
  if (!Number.isFinite(value)) return isInverse ? 0 : value;

  let result = Math.abs(value) ** (1 / degree);
  const rounded = Math.round(result);
  if (Number.isInteger(degree) && rounded ** degree === Math.abs(value)) result = rounded;
  if (value < 0) result = -result;
  return isInverse ? 1 / result : result;
};
