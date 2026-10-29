// The middle of a set of frame times, the mean of the two middle frames where the count is even, and zero for no frame
export const computeMedianFrameTime = (frameTimes: readonly number[]): number => {
  const sorted = frameTimes.toSorted((firstTime, secondTime) => firstTime - secondTime);
  const lowerMiddle = sorted[Math.floor((sorted.length - 1) / 2)] ?? 0;
  const upperMiddle = sorted[Math.floor(sorted.length / 2)] ?? 0;
  return (lowerMiddle + upperMiddle) / 2;
};
