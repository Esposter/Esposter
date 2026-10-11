// A test over the length of a string or array, for a path whose value is either
export const length =
  (test: (length: number) => boolean) =>
  (value: undefined | { length: number }): boolean =>
    value !== undefined && test(value.length);
