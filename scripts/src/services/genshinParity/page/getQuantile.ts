// The share of the frames read off their sorted times
export const getQuantile = (sorted: readonly number[], share: number): number =>
  sorted[Math.min(Math.floor(sorted.length * share), sorted.length - 1)] ?? 0;
