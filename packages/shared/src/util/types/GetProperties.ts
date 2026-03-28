export type GetProperties<
  T,
  Prefix extends string = "",
  Depth extends unknown[] = [unknown, unknown, unknown, unknown, unknown],
  IsRoot extends boolean = true,
> = Depth extends []
  ? never
  : NonNullable<T> extends infer O
    ? {
        [K in keyof O & string]: K extends `${number}`
          ? never
          : NonNullable<O[K]> extends Function
            ? never
            :
                | (Depth extends [unknown, ...infer Rest]
                    ? GetProperties<O[K], IsRoot extends true ? K : `${Prefix}.${K}`, Rest, false>
                    : never)
                | { path: IsRoot extends true ? K : `${Prefix}.${K}`; value: O[K] };
      }[keyof O & string]
    : never;
