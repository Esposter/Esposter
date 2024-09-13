import type { SkipFirst } from "@/utils/types/SkipFirst";
import type { TakeFirst } from "@/utils/types/TakeFirst";

export type TupleSlice<T extends unknown[], S extends number, E extends number = T["length"]> = SkipFirst<
  TakeFirst<T, E>,
  S
>;
