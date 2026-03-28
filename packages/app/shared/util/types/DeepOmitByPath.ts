import type { Except } from "type-fest";

export type DeepOmitByPath<T, Path extends PropertyKey> = T extends object
  ? T extends readonly unknown[]
    ? DeepOmitArray<T, Path>
    : DeepOmitObject<T, Path>
  : T;

type DeepOmitArray<T, Path extends PropertyKey> = T extends readonly unknown[]
  ? T extends []
    ? []
    : T extends [infer First, ...infer Rest]
      ? [DeepOmitByPath<First, Path>, ...DeepOmitArray<Rest, Path>]
      : DeepOmitByPath<T[number], Path>[]
  : T;

type DeepOmitObject<T, Path extends PropertyKey> = Path extends `${infer Root}.${infer Rest}`
  ? Root extends keyof T
    ? T[Root] extends object
      ? Except<T, Root> & Record<Root, DeepOmitByPath<T[Root], Rest>> extends infer O
        ? { [K in keyof O]: O[K] }
        : never
      : T
    : T
  : Path extends keyof T
    ? Except<T, Path>
    : T;
