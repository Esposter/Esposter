export type MergeObjectsStrict<T extends object[]> = T extends [infer TFirst, infer TSecond, ...infer TRemaining]
  ? TSecond extends { [K in keyof TSecond]: K extends keyof TFirst ? never : TSecond[K] }
    ? TRemaining extends object[]
      ? MergeObjectsStrict<[TSecond, ...TRemaining]> & TFirst
      : TFirst & TSecond
    : never
  : T extends [infer TFirst]
    ? TFirst
    : never;
