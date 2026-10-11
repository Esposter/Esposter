import type { FunctionLike } from "#src/util/types/FunctionLike";
import type { Primitive } from "type-fest";

// Kept over type-fest PartialOnUndefinedDeep, which leaves a key typed unknown required, while this type makes it optional
// (undefined extends unknown), and ToData relies on that: an unknown-typed field of an entity is optional in its data.
export type DeepOptionalUndefined<T> = T extends Date | FunctionLike | Primitive
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
