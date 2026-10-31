let latestNanoseconds = 0n;
// Epoch nanoseconds from the platform's own clock, which a window, a worker and Node all have: where the clock started
// Plus the time since it, summed as integers because a double holding the sum is good to about 250 ns, and two calls
// That close would tie. A reading that still lands on or before the last answer, from a clock a browser clamps or a
// Test freezes, steps one past it, so no two calls in a process share a value and the clock stepping back reorders none
export const now = (): string => {
  const originNanoseconds = BigInt(Math.round(performance.timeOrigin * 1e3)) * 1000n;
  const nanoseconds = originNanoseconds + BigInt(Math.round(performance.now() * 1e6));
  latestNanoseconds = nanoseconds > latestNanoseconds ? nanoseconds : latestNanoseconds + 1n;
  return latestNanoseconds.toString();
};
