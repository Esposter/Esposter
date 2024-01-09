export const getPropertyNames = <T>() =>
  new Proxy(
    {},
    {
      get: (_, prop, __) => prop,
    },
  ) as {
    [P in keyof T]: P;
  };
