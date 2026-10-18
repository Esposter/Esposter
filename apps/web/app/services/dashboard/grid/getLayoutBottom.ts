import type { GridItem } from "@/models/dashboard/GridItem";

// The row the lowest item ends on, which is what the grid's height is drawn from
export const getLayoutBottom = (layout: GridItem[]) => Math.max(0, ...layout.map((item) => item.y + item.h));
