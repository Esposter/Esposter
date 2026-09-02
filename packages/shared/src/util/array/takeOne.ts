/* oxlint-disable typescript/no-useless-default-assignment -- the rule reads this implementation signature, where `index` is required, rather than the array overload that makes it optional; the default is what a single-argument call indexes by */
import type { TakeOne } from "#src/models/shared/TakeOne";
// Workaround for noUncheckedIndexedAccess
export const takeOne: TakeOne = <T extends readonly unknown[] | Record<PropertyKey, unknown>>(
  values: T,
  index: keyof T = 0,
): T[keyof T] => {
  // Index and key access share the same syntax, and the overloads already restrict the inputs.
  const value = values[index];
  return value;
};
