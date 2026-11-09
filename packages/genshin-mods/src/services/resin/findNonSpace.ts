// The index of the first character from `from` that is not whitespace and lies before `to`, or `to` when none does
export const findNonSpace = (code: string, from: number, to: number): number => {
  let index = from;
  while (index < to && /\s/u.test(code.charAt(index))) index++;
  return index;
};
