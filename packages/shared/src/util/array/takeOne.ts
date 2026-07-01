import type { TakeOne } from "@/models/shared/TakeOne";
// Workaround for noUncheckedIndexedAccess
export const takeOne: TakeOne = <T extends readonly unknown[] | Record<PropertyKey, unknown>>(
  values: T,
  index: keyof T = 0,
): T[keyof T] => {
  // Index and key access share the same syntax, and the overloads already restrict the inputs.
  const value = values[index];
  return value;
};
