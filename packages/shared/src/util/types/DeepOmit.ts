import type { Primitive } from "type-fest";

export type DeepOmit<T, TKey extends PropertyKey> = [T] extends [Date | Function | Primitive]
  ? T
  : [Record<string, unknown>] extends [T]
    ? T
    : T extends object
      ? T extends unknown[]
        ? T extends readonly unknown[]
          ? { [K in keyof T]: DeepOmit<T[K], TKey> }
          : DeepOmit<T[number], TKey>[]
        : {
            [P in keyof T as P extends TKey ? never : P]: DeepOmit<T[P], TKey>;
          }
      : T;
