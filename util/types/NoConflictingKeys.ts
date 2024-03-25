export type NoConflictingKeys<T extends object[]> = T extends [infer TFirst, infer TSecond, ...infer TRemaining]
  ? TSecond extends { [K in keyof TSecond]: K extends keyof TFirst ? never : TSecond[K] }
    ? TRemaining extends object[]
      ? NoConflictingKeys<[TSecond, ...TRemaining]>
      : TFirst & TSecond
    : TFirst & TSecond
  : T extends [infer TFirst]
    ? TFirst
    : never;
