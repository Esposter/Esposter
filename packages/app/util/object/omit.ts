import type { Except, TupleToUnion } from "type-fest";

export const omit = <T extends object>(object: T, keys: (keyof T)[]) =>
  Object.fromEntries(Object.entries(object).filter(([k]) => !keys.includes(k as keyof T))) as Except<
    T,
    TupleToUnion<typeof keys>
  >;
