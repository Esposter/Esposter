import type { ResolvedRegion } from "#src/models/ResolvedRegion";

// A layout resolved for a context: the canvas, which is always present, and the regions that hold a present panel.
// The regions are in the layout's order.
export interface ResolvedLayout {
  canvasId: string;
  regions: ResolvedRegion[];
}
