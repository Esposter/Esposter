import type { Except } from "@/util/types/Except";

type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

export type ExcludeFunctionProperties<T> = Except<T, FunctionPropertyNames<T>>;
