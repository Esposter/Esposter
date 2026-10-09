import type { WindriseSurfaces } from "#src/models/windrise/WindriseSurfaces";
import type { GroundLayerField, GroundPaint } from "genshin-engine";

import { GroundLayer } from "genshin-engine";
import { Color } from "three";

// Windrise's ground as its terrain paints it: grass, bare earth and rock lie where the base maps place them, as fitted
// Into the ground layers' field of their shares, never by a slope or a height, and each layer paints the mean of the
// Base-map texels classed into it, as fitted into the ground surface's layers (a layer the base maps hold no texel of
// Takes the ground's mean). Its layers' weights also place the flowers
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
