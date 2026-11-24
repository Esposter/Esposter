import type { GroundPoint } from "genshin-engine";
import type { WorldLayer } from "genshin-world";

// An area of a region the catalogue names, with the layer it lies on and the outline it is given, if any. Only an area
// On the surface layer is a piece of its region's surface ground
export interface GroundPieceArea {
  id: string;
  layer: WorldLayer;
  outline: GroundPoint[];
}
