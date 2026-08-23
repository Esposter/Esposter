import type { GetPaths } from "#src/util/types/GetPaths";

export type PropertyNames<T> = {
  [P in GetPaths<T>]: P;
};
