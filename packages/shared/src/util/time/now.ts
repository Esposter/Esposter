let latestNanoseconds = 0n;
// Epoch nanoseconds from the platform's own clock, which a window, a worker and Node all have. A double holds epoch
// Milliseconds to about 250 ns, and a browser clamps its clock far coarser, so a reading that lands on or before the
// Last answer steps one past it: no two calls in a process share a value, and the clock stepping back never reorders them
export const now = (): string => {
  const milliseconds = performance.timeOrigin + performance.now();
  const wholeMilliseconds = Math.floor(milliseconds);
  const nanoseconds =
    BigInt(wholeMilliseconds) * 10n ** 6n + BigInt(Math.round((milliseconds - wholeMilliseconds) * 1e6));
  latestNanoseconds = nanoseconds > latestNanoseconds ? nanoseconds : latestNanoseconds + 1n;
  return latestNanoseconds.toString();
};
