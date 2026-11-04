import type { GridBlock } from "#src/models/GridBlock";

// What a release writes back: the cells one gesture changed
export interface GridCommit {
  changes: GridBlock[];
}
