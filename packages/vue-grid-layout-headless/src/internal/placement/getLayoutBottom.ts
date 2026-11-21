import type { GridBlock } from "#src/models/GridBlock";

// The row the lowest item ends on, or zero for an empty layout
export const getLayoutBottom = (layout: GridBlock[]): number => Math.max(0, ...layout.map((item) => item.y + item.h));
