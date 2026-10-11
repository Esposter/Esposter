import type { FunctionLike } from "#src/util/types/FunctionLike";
import type { Primitive } from "type-fest";

// The built-ins `omitDeep` keeps by reference, since each has internal slots a key walk would destroy
type DeepOmitKeptValue =
  | ArrayBufferView
  | Date
  | FunctionLike
  | Map<unknown, unknown>
  | Primitive
  | Promise<unknown>
  | RegExp
  | Set<unknown>;

// Distributive over a union, so a kept member of a union is kept while its object members are walked
export type DeepOmit<T, TKey extends PropertyKey> = T extends DeepOmitKeptValue
  ? T
  : T extends readonly unknown[]
    ? { [K in keyof T]: DeepOmit<T[K], TKey> }
    : T extends object
      ? {
          [P in keyof T as P extends symbol ? never : P extends TKey ? never : P]: DeepOmit<T[P], TKey>;
        }
      : T;
