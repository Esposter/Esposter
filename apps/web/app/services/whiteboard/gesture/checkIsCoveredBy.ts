import type { Bounds } from "vue-block-editor-headless";

// Whether a box lies fully within a covering box, each of its edges inside the covering box's on every side
export const checkIsCoveredBy = (bounds: Bounds, coveringBounds: Bounds): boolean =>
  bounds.x >= coveringBounds.x &&
  bounds.y >= coveringBounds.y &&
  bounds.x + bounds.width <= coveringBounds.x + coveringBounds.width &&
  bounds.y + bounds.height <= coveringBounds.y + coveringBounds.height;
