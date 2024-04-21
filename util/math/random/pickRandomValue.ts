import { InvalidOperationError } from "@/models/error/InvalidOperationError";
import { Operation } from "@/models/shared/Operation";
import { pickRandomLength } from "@/util/math/random/pickRandomLength";
import type { ArrayElement } from "type-fest/source/internal";

export const pickRandomValue = <T extends string | unknown[]>(values: T) => {
  if (values.length === 0) throw new InvalidOperationError(Operation.Read, "cannot pick random value of empty array");
  return values[pickRandomLength(values)] as ArrayElement<T>;
};
