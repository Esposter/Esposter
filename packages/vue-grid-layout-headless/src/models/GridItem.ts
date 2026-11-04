import type { GridBlock } from "#src/models/GridBlock";

// A cell the grid places, named by the entity it lays out
export interface GridItem extends GridBlock {
  // Whether the item takes its rows from the content it reports, rather than from its saved span. An item with no such
  // Height is stated as false, so the grid never reads an absent flag
  isAutoHeight: boolean;
}
