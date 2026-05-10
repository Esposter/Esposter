import type { SkipFirst } from "@/util/types/SkipFirst";
import type { TakeFirst } from "@/util/types/TakeFirst";

export type TupleSlice<T extends unknown[], S extends number, E extends number = T["length"]> = E extends T["length"]
  ? SkipFirst<T, S>
  : SkipFirst<TakeFirst<T, E>, S>;
