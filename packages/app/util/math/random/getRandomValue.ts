import type { ArrayElement } from "type-fest/source/internal";

import { generateRandomInteger } from "@/shared/util/math/random/generateRandomInteger";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const getRandomValue = <T extends string | unknown[]>(values: T) => {
  if (values.length === 0)
    throw new InvalidOperationError(Operation.Read, getRandomValue.name, "cannot pick random value from empty array");
  return values[generateRandomInteger(values.length)] as ArrayElement<T>;
};
