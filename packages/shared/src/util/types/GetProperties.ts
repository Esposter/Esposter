export type GetProperties<
  T,
  Prefix extends string = "",
  Depth extends unknown[] = [unknown, unknown, unknown, unknown, unknown],
  IsRoot extends boolean = true,
> = Depth extends []
  ? never
  : NonNullable<T> extends infer O
    ? O extends unknown[]
      ? // Handle arrays and tuples
          | (Depth extends [unknown, ...infer Rest]
              ? GetProperties<O[number], IsRoot extends true ? `${Prefix}[number]` : `${Prefix}.[number]`, Rest, false>
              : never)
          | {
              path: IsRoot extends true ? "length" : `${Prefix}.length`;
              value: O extends { length: infer L } ? L : number;
            }
      : O extends object
        ? {
            [K in keyof KnownKeys<O> & (number | string)]: K extends `${number}`
              ? never
              : NonNullable<O[K]> extends Function
                ? never
                :
                    | (Depth extends [unknown, ...infer Rest]
                        ? GetProperties<O[K], IsRoot extends true ? `${K}` : `${Prefix}.${K}`, Rest, false>
                        : never)
                    | { path: IsRoot extends true ? `${K}` : `${Prefix}.${K}`; value: O[K] };
          }[keyof KnownKeys<O> & (number | string)]
        : // For primitive types
          O extends string
          ? { path: IsRoot extends true ? "length" : `${Prefix}.length`; value: number }
          : O extends symbol
            ?
                | (Depth extends [unknown, ...infer Rest]
                    ? GetProperties<
                        string | undefined,
                        IsRoot extends true ? "description" : `${Prefix}.description`,
                        Rest,
                        false
                      >
                    : never)
                | { path: IsRoot extends true ? "description" : `${Prefix}.description`; value: string | undefined }
            : never
    : never;

type KnownKeys<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K];
};
