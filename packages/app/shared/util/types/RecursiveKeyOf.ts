export type RecursiveKeyOf<T> = T extends object
  ? T extends Date | Function | Map<unknown, unknown> | RegExp | Set<unknown> | unknown[]
    ? never
    : {
        [K in keyof T]: K extends number | string
          ? T[K] extends Date | Function | Map<unknown, unknown> | RegExp | Set<unknown> | unknown[]
            ? `${K}`
            : T[K] extends object
              ? `${K}.${RecursiveKeyOf<T[K]>}` | `${K}`
              : `${K}`
          : never;
      }[keyof T]
  : never;
