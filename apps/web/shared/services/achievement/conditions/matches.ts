export const matches =
  (pattern: RegExp) =>
  (value: string | undefined): boolean =>
    value !== undefined && pattern.test(value);
