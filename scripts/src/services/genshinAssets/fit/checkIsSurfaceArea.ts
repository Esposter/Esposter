import type { GroundPieceArea } from "#src/models/genshinAssets/shared/GroundPieceArea";

import { WorldLayer } from "genshin-world";

// Whether an area lies on the surface layer. An area on another layer, such as Enkanomiya or the underground mines, carries
// Its own terrain, so it is neither a piece of its region's surface ground nor a hole the all-or-nothing rule guards
export const checkIsSurfaceArea = ({ layer }: GroundPieceArea): boolean => layer === WorldLayer.Surface;
