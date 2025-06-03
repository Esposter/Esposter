type PropertyNames<T> = {
  [P in keyof T]: P;
};

export const getPropertyNames = <T>(): PropertyNames<T> =>
  new Proxy(
    {},
    {
      get: (_target, property) => property,
    },
  ) as PropertyNames<T>;
