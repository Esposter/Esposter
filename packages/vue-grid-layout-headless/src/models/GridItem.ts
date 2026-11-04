import type { GridCell } from "#src/models/GridCell";

// A cell the grid places, named by the entity it lays out
export interface GridItem extends GridCell {
  id: string;
  // Whether the item takes its rows from the content it reports, rather than from its saved span
  isAutoHeight?: boolean;
}
