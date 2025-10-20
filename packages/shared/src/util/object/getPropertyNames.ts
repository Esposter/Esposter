import type { PropertyNames } from "@/util/types/PropertyNames";

export const getPropertyNames = <T>(): PropertyNames<T> =>
  new Proxy(
    {},
    {
      get: (_target, property) => property,
    },
  ) as PropertyNames<T>;
