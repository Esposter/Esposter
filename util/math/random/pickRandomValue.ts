import { Operation } from "@/models/shared/Operation";
import { generateRandomInte~/packages/shared/models/shared/Operationandom/generateRandomInteger";
import type { ArrayElement } from "type-fest/source/internal";
import { InvalidOperationError } from "~/packages/shared/models/error/InvalidOperationError";

export const pickRandomValue = <T extends string | unknown[]>(values: T) => {
  if (values.length === 0)
    throw new InvalidOperationError(Operation.Read, pickRandomValue.name, "cannot pick random value from empty array");
  return values[generateRandomInteger(values.length)] as ArrayElement<T>;
};
