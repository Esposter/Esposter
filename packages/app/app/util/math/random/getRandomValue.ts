import { createRandomInteger } from "#shared/util/math/random/createRandomInteger";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const getRandomValue = <T extends string | unknown[]>(values: T) => {
  if (values.length === 0)
    throw new InvalidOperationError(Operation.Read, getRandomValue.name, "cannot pick random value from empty array");
  return values[createRandomInteger(values.length)] as T[number];
};
