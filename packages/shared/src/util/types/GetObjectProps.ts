import type { FunctionLike } from "#src/util/types/FunctionLike";
import type { GetProperties } from "#src/util/types/GetProperties";
import type { GetPropertyPath } from "#src/util/types/GetPropertyPath";
import type { OmitIndexSignature } from "type-fest";

export type GetObjectProps<T, P extends string, D extends unknown[], R extends boolean> = {
  [K in keyof OmitIndexSignature<T> & (number | string)]: K extends `${number}`
    ? never
    : NonNullable<T[K]> extends FunctionLike
      ? never
      : | (D extends [unknown, ...infer Rest] ? GetProperties<T[K], GetPropertyPath<P, `${K}`, R>, Rest, false> : never)
        | { path: GetPropertyPath<P, `${K}`, R>; value: T[K] };
}[keyof OmitIndexSignature<T> & (number | string)];
