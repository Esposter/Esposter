import { InvalidOperationError, Operation } from "@esposter/shared";

// The live claims a fill target names, a whole number of claims, rejecting anything else
export const parseFillTarget = (value: string): number => {
  const target = Number(value);
  if (!Number.isInteger(target) || target < 0)
    throw new InvalidOperationError(Operation.Read, value, "a fill target is a whole number of claims");
  return target;
};
