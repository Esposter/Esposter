import type { Except } from "@/util/types/Except";
import type { TupleToUnion } from "type-fest";

export const omit = <T extends object, TKeys extends (keyof T)[]>(obj: T, keys: TKeys) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k as keyof T))) as Except<
    T,
    TupleToUnion<TKeys>
  >;
