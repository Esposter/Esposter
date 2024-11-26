export type TupleSplitHead<T extends unknown[], N extends number> = T["length"] extends N
  ? T
  : T extends [...infer R, unknown]
    ? TupleSplitHead<R, N>
    : never;
