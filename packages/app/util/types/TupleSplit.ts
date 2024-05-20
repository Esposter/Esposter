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

export type TupleSplit<T extends unknown[], N extends number> = [TupleSplitHead<T, N>, TupleSplitTail<T, N>];
