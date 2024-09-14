export type TupleSplitTail<T, N extends number, O extends unknown[] = []> = O["length"] extends N
  ? T
  : T extends [infer F, ...infer R]
    ? TupleSplitTail<[...R], N, [...O, F]>
    : never;
