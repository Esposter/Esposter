import type { RequiredDeep } from "type-fest";

export type PropertyNames<T> = RequiredDeep<{
  [P in keyof T]: P;
}>;
