const BYTE = 255;
// The threshold splitting byte values into the two classes whose between-class variance is greatest (Otsu's): a value
// At or under it falls in the darker class
export const computeOtsuThreshold = (values: readonly number[]): number => {
  const histogram = Array.from({ length: BYTE + 1 }, () => 0);
  for (const value of values) histogram[Math.round(value)] = (histogram[Math.round(value)] ?? 0) + 1;
  const total = values.length;
  const sum = histogram.reduce((partial, count, value) => partial + count * value, 0);
  let [backgroundSum, backgroundCount, bestVariance, threshold] = [0, 0, 0, 0];
  for (const [value, count] of histogram.entries()) {
    backgroundCount += count;
    const foregroundCount = total - backgroundCount;
    if (backgroundCount === 0 || foregroundCount === 0) continue;
    backgroundSum += count * value;
    const variance =
      backgroundCount *
      foregroundCount *
      (backgroundSum / backgroundCount - (sum - backgroundSum) / foregroundCount) ** 2;
    if (variance > bestVariance) [bestVariance, threshold] = [variance, value];
  }
  return threshold;
};
