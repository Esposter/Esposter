import type { Threshold } from "@/models/math/Threshold";

import { takeOne } from "@esposter/shared";

export const step = (value: number, thresholds: Threshold[]): number => {
  for (const { speed, threshold } of thresholds) if (threshold && value <= threshold) return speed;
  return takeOne(thresholds, thresholds.length - 1).speed;
};
