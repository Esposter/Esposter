import type { GpuCall } from "#src/models/genshinParity/shared/GpuCall";

import { getCategory } from "#src/services/genshinParity/shared/getCategory";
import { roundMs } from "#src/services/genshinParity/shared/roundMs";

// Each cause's count and time in a frame, so a frame reads as its causes before its single calls
export const describeCategories = (calls: GpuCall[]): string => {
  const categories = new Map<string, { count: number; ms: number }>();
  for (const call of calls) {
    const category = getCategory(call.name);
    const total = categories.get(category) ?? { count: 0, ms: 0 };
    categories.set(category, { count: total.count + 1, ms: total.ms + call.duration });
  }

  return Array.from(categories, ([category, { count, ms }]) => `${category} ${count} (${roundMs(ms)} ms)`).join(", ");
};
