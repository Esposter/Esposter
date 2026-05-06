import type { GetProperties } from "@/util/types/GetProperties";

export type GetArrayProps<T extends unknown[], P extends string, D extends unknown[], R extends boolean> =
  | (D extends [unknown, ...infer Rest]
      ? GetProperties<T[number], R extends true ? `${P}[number]` : `${P}.[number]`, Rest, false>
      : never)
  | { path: R extends true ? "length" : `${P}.length`; value: T["length"] };
