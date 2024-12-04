interface Threshold {
  speed: number;
  threshold?: number;
}

export const step = (value: number, thresholds: Threshold[]): number => {
  for (const { speed, threshold } of thresholds) if (threshold && value <= threshold) return speed;
  return thresholds[thresholds.length - 1].speed;
};
