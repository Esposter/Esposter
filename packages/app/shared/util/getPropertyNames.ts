import type { RequiredDeep } from "type-fest";

type PropertyNames<T> = RequiredDeep<{
  [P in keyof T]: P;
}>;

export const getPropertyNames = <T>(): PropertyNames<T> =>
  new Proxy(
    {},
    {
      get: (_target, property) => property,
    },
  ) as PropertyNames<T>;
