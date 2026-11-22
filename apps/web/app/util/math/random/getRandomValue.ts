import { createRandomInteger } from "#src/util/math/random/createRandomInteger";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

export const getRandomValue = <T extends unknown[]>(values: T) => {
  if (values.length === 0)
    throw new InvalidOperationError(Operation.Read, getRandomValue.name, "cannot pick random value from empty values");
  else return takeOne(values, createRandomInteger(values.length));
};
