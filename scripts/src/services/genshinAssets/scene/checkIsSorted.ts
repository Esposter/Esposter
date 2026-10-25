export const checkIsSorted = (times: readonly number[]): boolean =>
  times.every((time, index) => index === 0 || time >= (times[index - 1] ?? 0));
