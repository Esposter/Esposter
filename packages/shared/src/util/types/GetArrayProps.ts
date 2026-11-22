import type { GetProperties } from "#src/util/types/GetProperties";
import type { GetPropertyPath } from "#src/util/types/GetPropertyPath";

export type GetArrayProps<T extends unknown[], P extends string, D extends unknown[], R extends boolean> =
  | (D extends [unknown, ...infer Rest]
      ? GetProperties<T[number], R extends true ? `${P}[number]` : `${P}.[number]`, Rest, false>
      : never)
  | { path: GetPropertyPath<P, "length", R>; value: T["length"] };
