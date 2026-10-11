export const isLessThan =
  (maximum: number) =>
  (value: number | undefined): boolean =>
    value !== undefined && value < maximum;
