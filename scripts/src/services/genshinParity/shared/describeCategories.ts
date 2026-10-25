import type { GpuCall } from "#src/models/genshinParity/shared/GpuCall";

import { getCategory } from "#src/services/genshinParity/shared/getCategory";
import { roundMs } from "#src/services/genshinParity/shared/roundMs";
import { tallyTime } from "#src/services/genshinParity/shared/tallyTime";

// Each cause's count and time in a frame, so a frame reads as its causes before its single calls
export const describeCategories = (calls: GpuCall[]): string => {
  const categories = new Map<string, { count: number; ms: number }>();
  for (const call of calls) tallyTime(categories, getCategory(call.name), call.duration);

  return Array.from(categories, ([category, { count, ms }]) => `${category} ${count} (${roundMs(ms)} ms)`).join(", ");
};
