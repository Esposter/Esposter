import type { Primitive } from "type-fest";

export type DeepOptionalUndefined<T> = T extends Date | Function | Primitive
  ? T
  : T extends unknown[]
    ? { [K in keyof T]: DeepOptionalUndefined<T[K]> }
    : T extends object
      ? {
          [K in keyof T as undefined extends T[K] ? K : never]?: DeepOptionalUndefined<T[K]>;
        } & {
          [K in keyof T as undefined extends T[K] ? never : K]: DeepOptionalUndefined<T[K]>;
        } extends infer O
        ? { [K in keyof O]: O[K] }
        : never
      : T;
