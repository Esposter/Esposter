// Typed by the path it is applied to rather than by its argument, so `equals(-1)` on a path of `-1 | 1` accepts both
export const equals =
  <TValue>(expected: NoInfer<TValue>) =>
  (value: TValue): boolean =>
    value === expected;
