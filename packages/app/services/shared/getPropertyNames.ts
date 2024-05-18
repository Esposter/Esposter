export const getPropertyNames = <T>() =>
  new Proxy(
    {},
    {
      get: (_, prop) => prop,
    },
  ) as {
    [P in keyof T]: P;
  };
