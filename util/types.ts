// https://stackoverflow.com/questions/67605122/obtain-a-slice-of-a-typescript-parameters-tuple
type TupleSplitHead<T extends unknown[], N extends number> = T["length"] extends N
  ? T
  : T extends [...infer R, unknown]
    ? TupleSplitHead<R, N>
    : never;

type TupleSplitTail<T, N extends number, O extends unknown[] = []> = O["length"] extends N
  ? T
  : T extends [infer F, ...infer R]
    ? TupleSplitTail<[...R], N, [...O, F]>
    : never;

type TupleSplit<T extends unknown[], N extends number> = [TupleSplitHead<T, N>, TupleSplitTail<T, N>];

type TakeFirst<T extends unknown[], N extends number> = TupleSplit<T, N>[0];

export type SkipFirst<T extends unknown[], N extends number> = TupleSplit<T, N>[1];

export type TupleSlice<T extends unknown[], S extends number, E extends number = T["length"]> = SkipFirst<
  TakeFirst<T, E>,
  S
>;
