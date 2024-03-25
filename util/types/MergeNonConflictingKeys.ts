export type MergeNonConflictingKeys<T extends object[]> = T extends [infer TFirst, infer TSecond, ...infer TRemaining]
  ? TSecond extends { [K in keyof TSecond]: K extends keyof TFirst ? never : TSecond[K] }
    ? TRemaining extends object[]
      ? MergeNonConflictingKeys<[TSecond, ...TRemaining]>
      : TFirst & TSecond
    : never
  : T extends [infer TFirst]
    ? TFirst
    : never;
