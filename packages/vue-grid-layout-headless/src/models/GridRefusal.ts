import type { GridItem } from "#src/models/GridItem";

// Whether a grid refuses an item dragged into it, asked before anything is previewed or committed. The target is the grid's
// Root element, which a consumer reads its own data attribute from to know which group the grid stands for
export type GridRefusal = (item: GridItem, target: HTMLElement) => boolean;
