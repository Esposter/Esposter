// The middle of a list of numbers, the upper of the middle two when they are even, or 0 for none: always a value the
// List holds, which a fit keeps where an average of two would invent a colour or a tilt no texel has
export const computeUpperMedian = (values: readonly number[]): number =>
  values.toSorted((first, second) => first - second)[Math.floor(values.length / 2)] ?? 0;
