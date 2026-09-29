// Nuxt's own `pick` result type, which `nuxt/app` returns from `useAsyncData` without exporting
export type PickFrom<T, TKeys extends string[]> = T extends unknown[]
  ? T
  : T extends Record<string, unknown>
    ? keyof T extends TKeys[number]
      ? T
      : TKeys[number] extends never
        ? T
        : Pick<T, TKeys[number]>
    : T;
