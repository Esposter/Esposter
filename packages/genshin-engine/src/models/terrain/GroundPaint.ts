import type { GroundBand } from "#src/models/terrain/GroundBand";
import type { GroundLayer } from "#src/models/terrain/GroundLayer";
import type { GroundLayerColors } from "#src/models/terrain/GroundLayerColors";
import type { GroundLayerField } from "#src/models/terrain/GroundLayerField";
import type { GroundPathSegment } from "#src/models/terrain/GroundPathSegment";

// How a biome paints its ground: each layer's colours, how wide the patches they turn across are in metres, where its
// Layers lie, and the rules that lay a layer over them, in order. Its layers lie where its field places them, fitted to
// Where the game's terrain places its own, or grass everywhere where it has none. Earth and rock come in by the slope,
// From 0 flat to 1 sheer; sand by the height up from the shore and snow by the height up to the snow line; each only
// Where a biome has one; and path along its segments, fading into what is round it past their half width over its
// Falloff in metres
export interface GroundPaint {
  earthSlope?: GroundBand;
  layerColors: Record<GroundLayer, GroundLayerColors>;
  layerField?: GroundLayerField;
  patchScale: number;
  pathFalloff: number;
  paths: GroundPathSegment[];
  rockSlope?: GroundBand;
  sandHeight?: GroundBand;
  snowHeight?: GroundBand;
}
