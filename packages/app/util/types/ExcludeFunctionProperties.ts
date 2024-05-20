import type { Except } from "type-fest";

type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

export type ExcludeFunctionProperties<T> = Except<T, FunctionPropertyNames<T>>;
