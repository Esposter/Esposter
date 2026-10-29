export const combine = (from: readonly number[], to: readonly number[], share: number): number[] =>
  from.map((value, index) => value + share * ((to[index] ?? 0) - value));
