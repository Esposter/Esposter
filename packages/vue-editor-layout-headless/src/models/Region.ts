import type { RegionEdge } from "#src/models/RegionEdge";
import type { RegionOpening } from "#src/models/RegionOpening";
import type { RegionPresentation } from "#src/models/RegionPresentation";
import type { SizeClass } from "#src/models/SizeClass";

// A strip at one edge of the window that holds the panels naming it. The reader sizes it between its limits
export interface Region {
  // The size a region takes until the reader resizes it
  defaultSize: number;
  // The edge a region sits at, unless its size class names another
  edge: RegionEdge;
  id: string;
  // The largest and smallest size a region is held between, whether the reader resizes it or a stored size is read back
  maximumSize: number;
  minimumSize: number;
  opening: RegionOpening;
  // The edge for each size class that differs from the region's own
  sizeClassEdgeMap: Partial<Record<SizeClass, RegionEdge>>;
  // How the region is presented for each size class
  sizeClassPresentationMap: Record<SizeClass, RegionPresentation>;
}
