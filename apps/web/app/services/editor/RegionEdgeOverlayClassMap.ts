// @unocss-include
import { RegionEdge } from "vue-editor-layout-headless";

// Where an overlay floats over the canvas: pinned to its edge, and sized by the region's own width or height, above the
// Canvas it is drawn over
export const RegionEdgeOverlayClassMap = {
  [RegionEdge.Bottom]: "absolute bottom-0 inset-x-0 z-10",
  [RegionEdge.End]: "absolute right-0 inset-y-0 z-10",
  [RegionEdge.Start]: "absolute left-0 inset-y-0 z-10",
  [RegionEdge.Top]: "absolute top-0 inset-x-0 z-10",
} as const satisfies Record<RegionEdge, string>;
