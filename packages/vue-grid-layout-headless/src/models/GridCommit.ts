import type { GridItem } from "#src/models/GridItem";

// What a release writes back: the cells one gesture changed or added, and the ids it took away from this grid
export interface GridCommit {
  changes: GridItem[];
  removed: string[];
}
