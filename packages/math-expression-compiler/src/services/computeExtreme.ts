// The extreme of a list as mathjs's max and min fold it from a starting value: a NaN answers NaN, and a value replaces the
// Extreme so far only where it is preferred over it, which a nearly equal value never is, so the first of the two is kept
export const computeExtreme = (
  values: readonly number[],
  initial: number,
  checkIsPreferred: (value: number, extreme: number) => boolean,
): number => {
  let extreme = initial;
  for (const value of values) {
    if (Number.isNaN(value)) return Number.NaN;
    if (checkIsPreferred(value, extreme)) extreme = value;
  }
  return extreme;
};
