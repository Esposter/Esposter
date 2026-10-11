export const checkIsSameValueZero = (first: unknown, second: unknown): boolean =>
  first === second || (Number.isNaN(first) && Number.isNaN(second));
