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

type GetArrayProps<T extends unknown[], P extends string, D extends unknown[], R extends boolean> =
  | (D extends [unknown, ...infer Rest]
      ? GetProperties<T[number], R extends true ? `${P}[number]` : `${P}.[number]`, Rest, false>
      : never)
  | { path: R extends true ? "length" : `${P}.length`; value: T["length"] };

type GetObjectProps<T, P extends string, D extends unknown[], R extends boolean> = {
  [K in keyof KnownKeys<T> & (number | string)]: K extends `${number}`
    ? never
    : [NonNullable<T[K]>] extends [never]
      ? never
      : NonNullable<T[K]> extends Function
        ? never
        :
            | (D extends [unknown, ...infer Rest]
                ? GetProperties<T[K], R extends true ? `${K}` : `${P}.${K}`, Rest, false>
                : never)
            | { path: R extends true ? `${K}` : `${P}.${K}`; value: T[K] };
}[keyof KnownKeys<T> & (number | string)];

type GetPrimitiveProps<T, P extends string, D extends unknown[], R extends boolean> = T extends string
  ? { path: R extends true ? "length" : `${P}.length`; value: number }
  : T extends symbol
    ?
        | (D extends [unknown, ...infer Rest]
            ? GetProperties<string | undefined, R extends true ? "description" : `${P}.description`, Rest, false>
            : never)
        | { path: R extends true ? "description" : `${P}.description`; value: string | undefined }
    : never;

type KnownKeys<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K];
};
