import type { GridItem } from "@/models/dashboard/GridItem";

import { DASHBOARD_GRID_MIN_SPAN } from "@/services/dashboard/constants";

// An item is at least one cell wide and tall, no wider than the columns, and kept inside them from its left edge
export const correctBounds = <T extends GridItem>(layout: T[], columnNumber: number) =>
  layout.map((item) => {
    const w = Math.max(DASHBOARD_GRID_MIN_SPAN, Math.min(item.w, columnNumber));
    const h = Math.max(DASHBOARD_GRID_MIN_SPAN, item.h);
    const x = Math.min(Math.max(0, item.x), columnNumber - w);
    return { ...item, h, w, x };
  });
