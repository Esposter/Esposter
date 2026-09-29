// Nuxt's own `pick` key type, which `nuxt/app` uses in `AsyncDataOptions` without exporting
export type KeysOf<T> = (T extends T ? (keyof T extends string ? keyof T : never) : never)[];
