import { InvalidOperationError } from "@/models/error/InvalidOperationError";
import { Operation } from "@/models/shared/Operation";

export const takeOne = <T>(values: T[], index = 0): T => {
  const value = values[index];
  if (value === undefined)
    throw new InvalidOperationError(Operation.Read, takeOne.name, `Values: ${values}, index: ${index} out of bounds`);
  return value;
};
