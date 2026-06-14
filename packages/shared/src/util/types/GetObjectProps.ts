import type { GetProperties } from "@/util/types/GetProperties";
import type { KnownKeys } from "@/util/types/KnownKeys";

export type GetObjectProps<T, P extends string, D extends unknown[], R extends boolean> = {
  [K in keyof KnownKeys<T> & (number | string)]: K extends `${number}`
    ? never
    : NonNullable<T[K]> extends Function
      ? never
      :
          | (D extends [unknown, ...infer Rest]
              ? GetProperties<T[K], R extends true ? `${K}` : `${P}.${K}`, Rest, false>
              : never)
          | { path: R extends true ? `${K}` : `${P}.${K}`; value: T[K] };
}[keyof KnownKeys<T> & (number | string)];
