import type { Decrement } from "@/util/types/Decrement";

export type GetPaths<T, Prefix extends string = "", Depth extends number = 5, IsRoot extends boolean = true> = [
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
                | GetPaths<O[K], IsRoot extends true ? K : `${Prefix}.${K}`, Decrement<Depth>, false>
                | (IsRoot extends true ? K : `${Prefix}.${K}`);
      }[keyof O & string]
    : never;
