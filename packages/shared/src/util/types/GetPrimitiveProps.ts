import type { GetProperties } from "#src/util/types/GetProperties";
import type { GetPropertyPath } from "#src/util/types/GetPropertyPath";

export type GetPrimitiveProps<T, P extends string, D extends unknown[], R extends boolean> = T extends string
  ? { path: GetPropertyPath<P, "length", R>; value: number }
  : T extends symbol
    ? // oxlint-disable-next-line selector-ban/no-restricted-syntax -- mirrors `Symbol.description`, which is genuinely `string | undefined`
      | { path: GetPropertyPath<P, "description", R>; value: string | undefined }
      | (D extends [unknown, ...infer Rest]
          ? GetProperties<string | undefined, GetPropertyPath<P, "description", R>, Rest, false>
          : never)
    : never;
