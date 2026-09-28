import type { FunctionLike } from "#src/util/types/FunctionLike";

export type FunctionProperties<T> = {
  [K in keyof T]: T[K] extends FunctionLike ? K : never;
};
