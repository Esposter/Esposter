export const isGreaterThan =
  (minimum: number) =>
  (value: number | undefined): boolean =>
    value !== undefined && value > minimum;
