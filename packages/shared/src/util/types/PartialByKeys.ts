import type { Except } from "type-fest";

export type PartialByKeys<T, K extends keyof T = keyof T> = Except<T, K> & Partial<Pick<T, Extract<keyof T, K>>>;
