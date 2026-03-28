import type { Decrement } from "@/util/types/Decrement";

export type GetProperties<T, Prefix extends string = "", Depth extends number = 5, IsRoot extends boolean = true> = [
  Depth,
] extends [never]
  ? never
  : NonNullable<T> extends infer O
    ? {
        [K in keyof O & string]: K extends `${number}`
          ? never
          : NonNullable<O[K]> extends Function
            ? never
            :
                | GetProperties<O[K], IsRoot extends true ? K : `${Prefix}.${K}`, Decrement<Depth>, false>
                | { path: IsRoot extends true ? K : `${Prefix}.${K}`; value: O[K] };
      }[keyof O & string]
    : never;
