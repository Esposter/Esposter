export type GetProperties<
  T,
  Prefix extends string = "",
  Depth extends unknown[] = [unknown, unknown, unknown, unknown, unknown],
  IsRoot extends boolean = true,
> = [T] extends [never]
  ? never
  : Depth extends []
    ? never
    : NonNullable<T> extends infer O
      ? O extends unknown[]
        ? GetArrayProps<O, Prefix, Depth, IsRoot>
        : O extends object
          ? GetObjectProps<O, Prefix, Depth, IsRoot>
          : GetPrimitiveProps<O, Prefix, Depth, IsRoot>
      : never;

type GetArrayProps<T extends unknown[], Prefix extends string, Depth extends unknown[], IsRoot extends boolean> =
  | (Depth extends [unknown, ...infer Rest]
      ? GetProperties<T[number], IsRoot extends true ? `${Prefix}[number]` : `${Prefix}.[number]`, Rest, false>
      : never)
  | {
      path: IsRoot extends true ? "length" : `${Prefix}.length`;
      value: T["length"];
    };

type GetObjectProps<T, Prefix extends string, Depth extends unknown[], IsRoot extends boolean> = {
  [K in keyof KnownKeys<T> & (number | string)]: K extends `${number}`
    ? never
    : NonNullable<T[K]> extends Function
      ? never
      :
          | (Depth extends [unknown, ...infer Rest]
              ? GetProperties<T[K], IsRoot extends true ? `${K}` : `${Prefix}.${K}`, Rest, false>
              : never)
          | { path: IsRoot extends true ? `${K}` : `${Prefix}.${K}`; value: T[K] };
}[keyof KnownKeys<T> & (number | string)];

type GetPrimitiveProps<T, Prefix extends string, Depth extends unknown[], IsRoot extends boolean> = T extends string
  ? { path: IsRoot extends true ? "length" : `${Prefix}.length`; value: number }
  : T extends symbol
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
    : never;

type KnownKeys<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K];
};
