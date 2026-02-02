import { InvalidOperationError } from "@/models/error/InvalidOperationError";
import { Operation } from "@/models/shared/Operation";

interface TakeOne {
  <T>(values: readonly T[], index?: number): T;
  <TKey extends number | string, TValue>(values: Record<TKey, TValue>, index: TKey): TValue;
}
// We'll cheat a little bit here since the syntax for index accessing and key accessing is the same
// And we're able to restrict the values passed in based on the overloaded types of the function
export const takeOne: TakeOne = <TKey extends number | string, T>(
  values: readonly T[] | Record<TKey, T>,
  index: number | TKey = 0,
) => {
  const value = values[index as keyof typeof values];
  if (value === undefined)
    throw new InvalidOperationError(Operation.Read, takeOne.name, `Values: ${values}, index: ${index} out of bounds`);
  return value;
};
