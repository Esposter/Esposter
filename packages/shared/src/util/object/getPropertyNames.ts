import type { PropertyNames } from "#src/util/types/PropertyNames";

export const getPropertyNames = <T>(): PropertyNames<T> =>
  new Proxy(
    {},
    {
      get: (_target, property) => property,
    },
  );
