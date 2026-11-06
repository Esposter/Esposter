import type { Region } from "#src/models/Region";
import type { RegionEdge } from "#src/models/RegionEdge";
import type { SizeClass } from "#src/models/SizeClass";

// The edge a region sits at for a size class: the edge that class names, or the region's own edge when it names none
export const getRegionEdge = (region: Region, sizeClass: SizeClass): RegionEdge =>
  region.sizeClassEdgeMap[sizeClass] ?? region.edge;
