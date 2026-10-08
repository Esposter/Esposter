import type { GroundPaint } from "#src/models/terrain/GroundPaint";
import type { TerrainTileOptions } from "#src/models/terrain/TerrainTileOptions";

import { GroundLayers } from "#src/models/terrain/GroundLayer";
import { createSimplexNoise } from "#src/noise/createSimplexNoise";
import { createGroundLayerWeights } from "#src/terrain/createGroundLayerWeights";
import { Color } from "three";

// A ground's colour at a vertex, painted by its layers' weights there (`createGroundLayerWeights`): each layer's colour
// Turns toward its patch colour across seeded patches of the paint's scale, and the layers are summed by their weights.
// The weights are solved per vertex, as the game holds its own per texel, so the coarse colour a vertex morphs toward is
// Painted the same way at the next level's vertex. Each colour is converted to the linear working space once
export const createGroundPaintColor = (groundPaint: GroundPaint, seed: number): TerrainTileOptions["writeColor"] => {
  const { layerColors, patchScale } = groundPaint;
  const getWeights = createGroundLayerWeights(groundPaint);
  const noise = createSimplexNoise(seed);
  const linearLayerColors = GroundLayers.map((layer) => ({
    color: new Color(layerColors[layer].color),
    layer,
    patchColor: new Color(layerColors[layer].patchColor),
  }));
  const layerColor = new Color();
  return (colors, offset, height, slope, x, z) => {
    const weights = getWeights(height, slope, x, z);
    const patch = (noise(x / patchScale, z / patchScale) + 1) / 2;
    let red = 0;
    let green = 0;
    let blue = 0;
    for (const { color, layer, patchColor } of linearLayerColors) {
      const weight = weights[layer];
      if (weight === 0) continue;
      layerColor.lerpColors(color, patchColor, patch);
      red += layerColor.r * weight;
      green += layerColor.g * weight;
      blue += layerColor.b * weight;
    }
    colors[offset] = red;
    colors[offset + 1] = green;
    colors[offset + 2] = blue;
  };
};
