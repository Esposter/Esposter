import { InvalidOperationError, Operation } from "@esposter/shared";

// A command line's whole count, read from its string since citty has no number type: a blank, a fraction or a value under
// the minimum is refused rather than read, since `Number` reads a blank as 0 and a non-number as NaN
export const parseWholeCount = (text: string, name: string, minimum: number): number => {
  const count = Number(text);
  if (text.trim() === "" || !Number.isInteger(count) || count < minimum)
    throw new InvalidOperationError(Operation.Read, name, `${text} is not a whole number of ${minimum} or more`);
  return count;
};
