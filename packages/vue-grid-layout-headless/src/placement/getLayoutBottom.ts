import type { GridItem } from "#src/models/GridItem";

// The row the lowest item ends on, or zero for an empty layout
export const getLayoutBottom = (layout: GridItem[]): number => Math.max(0, ...layout.map((item) => item.y + item.h));
