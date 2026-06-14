import type { GetArrayProps } from "@/util/types/GetArrayProps";
import type { GetObjectProps } from "@/util/types/GetObjectProps";
import type { GetPrimitiveProps } from "@/util/types/GetPrimitiveProps";

export type GetProperties<
  T,
  P extends string = "",
  D extends unknown[] = [unknown, unknown, unknown, unknown, unknown],
  R extends boolean = true,
> = [T] extends [never]
  ? never
  : D extends []
    ? never
    : NonNullable<T> extends infer O
      ? O extends unknown[]
        ? GetArrayProps<O, P, D, R>
        : O extends object
          ? GetObjectProps<O, P, D, R>
          : GetPrimitiveProps<O, P, D, R>
      : never;
