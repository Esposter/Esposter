import type { Except, TupleToUnion } from "type-fest";

export const omit = <T extends object, TKeys extends (keyof T)[]>(
  object: T,
  keys: TKeys,
): Except<T, TupleToUnion<TKeys>> =>
  Object.fromEntries(Object.entries(object).filter(([k]) => !keys.includes(k as keyof T)));
