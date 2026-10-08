import type { GroundBand } from "#src/models/terrain/GroundBand";
import type { GroundLayer } from "#src/models/terrain/GroundLayer";
import type { GroundLayerColors } from "#src/models/terrain/GroundLayerColors";
import type { GroundPathSegment } from "#src/models/terrain/GroundPathSegment";

// How a biome paints its ground: each layer's colours, how wide the patches they turn across are in metres, and the
// Rules that lay each layer over the grass under it, in order. Earth and rock come in by the slope, from 0 flat to 1
// Sheer; sand by the height up from the shore and snow by the height up to the snow line, each only where a biome has
// One; and path along its segments, fading into what is round it past their half width over its falloff in metres
export interface GroundPaint {
  earthSlope: GroundBand;
  layerColors: Record<GroundLayer, GroundLayerColors>;
  patchScale: number;
  pathFalloff: number;
  paths: GroundPathSegment[];
  rockSlope: GroundBand;
  sandHeight?: GroundBand;
  snowHeight?: GroundBand;
}
