import type { RegionEdge } from "#src/models/RegionEdge";
import type { RegionPresentation } from "#src/models/RegionPresentation";

// Where a region is drawn for a size class, and whether it is open there
export interface RegionPlacement {
  edge: RegionEdge;
  isOpen: boolean;
  presentation: RegionPresentation;
}
