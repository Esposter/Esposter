export const isAtLeast =
  (minimum: number) =>
  (value: number | undefined): boolean =>
    value !== undefined && value >= minimum;
