export type FunctionProperties<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
};
