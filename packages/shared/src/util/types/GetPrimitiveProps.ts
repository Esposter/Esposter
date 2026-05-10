import type { GetProperties } from "@/util/types/GetProperties";

export type GetPrimitiveProps<T, P extends string, D extends unknown[], R extends boolean> = T extends string
  ? { path: R extends true ? "length" : `${P}.length`; value: number }
  : T extends symbol
    ?
        | (D extends [unknown, ...infer Rest]
            ? GetProperties<string | undefined, R extends true ? "description" : `${P}.description`, Rest, false>
            : never)
        | { path: R extends true ? "description" : `${P}.description`; value: string | undefined }
    : never;
