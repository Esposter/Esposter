interface Threshold {
  threshold?: number;
  speed: number;
}

export const step = (value: number, thresholds: Threshold[]): number => {
  for (const { threshold, speed } of thresholds) if (threshold && value <= threshold) return speed;
  return thresholds[thresholds.length - 1].speed;
};
