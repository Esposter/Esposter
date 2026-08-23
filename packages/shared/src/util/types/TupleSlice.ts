import type { SkipFirst } from "#src/util/types/SkipFirst";
import type { TakeFirst } from "#src/util/types/TakeFirst";

export type TupleSlice<T extends unknown[], S extends number, E extends number = T["length"]> = E extends T["length"]
  ? SkipFirst<T, S>
  : SkipFirst<TakeFirst<T, E>, S>;
