import type { GetPaths } from "@/util/types/GetPaths";

export type PropertyNames<T> = {
  [P in GetPaths<T>]: P;
};
