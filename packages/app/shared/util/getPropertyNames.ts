type PropertyNames<T> = {
  [P in keyof T]: P;
};

export const getPropertyNames = <T>(): PropertyNames<T> =>
  new Proxy(
    {},
    {
      get: (_, property) => property,
    },
  ) as PropertyNames<T>;
