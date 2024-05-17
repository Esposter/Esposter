import { generateRandomInteger } from "@/util/math/random/generateRandomInteger";
import { InvalidOperationError, Operation } from "esposter-shared";
import type { ArrayElement } from "type-fest/source/internal";

export const pickRandomValue = <T extends string | unknown[]>(values: T) => {
  if (values.length === 0)
    throw new InvalidOperationError(Operation.Read, pickRandomValue.name, "cannot pick random value from empty array");
  return values[generateRandomInteger(values.length)] as ArrayElement<T>;
};
