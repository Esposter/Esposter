export type FunctionProperties<T> = {
  [K in keyof T]: T[K] extends (...args: never) => unknown ? K : never;
};
