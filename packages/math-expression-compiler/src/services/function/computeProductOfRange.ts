// The product of the integers from first to last, split in halves, so each rounding falls where mathjs's does
export const computeProductOfRange = (first: number, last: number): number => {
  if (last < first) return 1;
  if (last === first) return last;

  const middle = Math.floor((first + last) / 2);
  return computeProductOfRange(first, middle) * computeProductOfRange(middle + 1, last);
};
