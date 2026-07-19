import type { Primitive } from "type-fest";

// Recursively rewrites every `null` in T to `undefined`, converting the Drizzle/Azure boundary shape
// (`T | null`) into the app-owned absent-value sentinel (`T | undefined`). `null` is caught before the
// Primitive arm because type-fest's Primitive includes `null`.
export type NullToUndefined<T> = T extends null
  ? undefined
  : T extends Date | Function | Primitive
    ? T
    : T extends (infer U)[]
      ? NullToUndefined<U>[]
      : T extends object
        ? { [K in keyof T]: NullToUndefined<T[K]> }
        : T;
