import type { GridItem } from "#src/models/GridItem";

// What a release writes back: the cells one gesture changed
export interface GridCommit {
  changes: GridItem[];
}
