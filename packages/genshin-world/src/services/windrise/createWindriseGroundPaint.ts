import type { WindriseSurfaces } from "#src/models/windrise/WindriseSurfaces";
import type { GroundLayerField, GroundPaint } from "genshin-engine";

import { GroundLayer } from "genshin-engine/terrainWorker";
import { Color } from "three";

// Windrise's ground as its terrain paints it: each layer lies where the tiles' cells are painted in it, the roads its
// Path, as fitted into the ground layers' field of their shares, never by a slope or a height, and each layer paints the
// Mean of the base-map texels on its cells, as fitted into the ground surface's layers (a layer no texel stands on takes
// The ground's mean). Its layers' weights also place the flowers
export const createWindriseGroundPaint = (groundLayers: GroundLayerField, surfaces: WindriseSurfaces): GroundPaint => {
  const { color: groundColor, layers } = surfaces.Ground;
  const getGroundLayerColors = (layer: GroundLayer) => {
    const color = new Color(layers[layer] ?? groundColor).getHex();
    return { color, patchColor: color };
  };
  return {
    layerColors: {
      [GroundLayer.Earth]: getGroundLayerColors(GroundLayer.Earth),
      [GroundLayer.Grass]: getGroundLayerColors(GroundLayer.Grass),
      [GroundLayer.Path]: getGroundLayerColors(GroundLayer.Path),
      [GroundLayer.Rock]: getGroundLayerColors(GroundLayer.Rock),
      [GroundLayer.Sand]: getGroundLayerColors(GroundLayer.Sand),
      [GroundLayer.Snow]: getGroundLayerColors(GroundLayer.Snow),
    },
    layerField: groundLayers,
    patchScale: 18,
    pathFalloff: 0.6,
    paths: [],
  };
};
