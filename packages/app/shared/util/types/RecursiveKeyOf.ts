export type RecursiveKeyOf<T> = T extends object
  ? T extends Date | Function | Map<unknown, unknown> | RegExp | Set<unknown> | unknown[]
    ? never
    : {
        [K in keyof T]: K extends string
          ? T[K] extends object
            ? T[K] extends Date | Function | Map<unknown, unknown> | RegExp | Set<unknown> | unknown[]
              ? K
              : K | RecursiveKeyOf<T[K]>
            : K
          : never;
      }[keyof T]
  : never;
