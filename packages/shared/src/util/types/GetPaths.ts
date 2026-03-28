export type GetPaths<
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
                    ? GetPaths<O[K], IsRoot extends true ? K : `${Prefix}.${K}`, Rest, false>
                    : never)
                | (IsRoot extends true ? K : `${Prefix}.${K}`);
      }[keyof O & string]
    : never;
