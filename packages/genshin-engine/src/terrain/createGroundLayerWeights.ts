import type { GroundBand } from "#src/models/terrain/GroundBand";
import type { GroundPaint } from "#src/models/terrain/GroundPaint";

import { GroundLayer, GroundLayers } from "#src/models/terrain/GroundLayer";
import { fileByCell } from "#src/terrain/fileByCell";
import { measureSegment } from "#src/terrain/measureSegment";
import { sampleGroundLayerField } from "#src/terrain/sampleGroundLayerField";
import { MathUtils } from "three";

// How much of a layer a band lays at a measure of the ground: none at its start, all at its end, smoothly between
const getBandAmount = ({ end, start }: GroundBand, value: number): number =>
  end >= start ? MathUtils.smoothstep(value, start, end) : 1 - MathUtils.smoothstep(value, end, start);
// Lays a layer over what is painted under it by its amount, so the shares still sum to one
const layOver = (weights: Record<GroundLayer, number>, layer: GroundLayer, amount: number): void => {
  if (amount === 0) return;
  for (const groundLayer of GroundLayers) weights[groundLayer] *= 1 - amount;
  weights[layer] += amount;
};
// The share of each layer a point of ground is painted in, as the game's terrain holds a weight per layer: the shares
// The paint's field places there (`sampleGroundLayerField`), or grass under everything where it has none, then earth on
// The banks, sand at the shore, snow above the snow line, path along its segments and rock on what is steep, each rule
// The paint gives laid over what is under it by its own amount. Written into one record the function keeps and read
// Straight after, so no point allocates, and a path is read only in the cells its reach covers
export const createGroundLayerWeights = ({
  earthSlope,
  layerField,
  pathFalloff,
  paths,
  rockSlope,
  sandHeight,
  snowHeight,
}: Pick<
  GroundPaint,
  "earthSlope" | "layerField" | "pathFalloff" | "paths" | "rockSlope" | "sandHeight" | "snowHeight"
>): ((height: number, slope: number, x: number, z: number) => Readonly<Record<GroundLayer, number>>) => {
  const weights: Record<GroundLayer, number> = {
    [GroundLayer.Earth]: 0,
    [GroundLayer.Grass]: 0,
    [GroundLayer.Path]: 0,
    [GroundLayer.Rock]: 0,
    [GroundLayer.Sand]: 0,
    [GroundLayer.Snow]: 0,
  };
  const getPaths = fileByCell(paths, ({ endX, endZ, startX, startZ, width }) => {
    const reach = width / 2 + pathFalloff;
    return {
      maxX: Math.max(startX, endX) + reach,
      maxZ: Math.max(startZ, endZ) + reach,
      minX: Math.min(startX, endX) - reach,
      minZ: Math.min(startZ, endZ) - reach,
    };
  });
  return (height, slope, x, z) => {
    if (layerField) sampleGroundLayerField(layerField, x, z, weights);
    else {
      for (const groundLayer of GroundLayers) weights[groundLayer] = 0;
      weights[GroundLayer.Grass] = 1;
    }
    if (earthSlope) layOver(weights, GroundLayer.Earth, getBandAmount(earthSlope, slope));
    if (sandHeight) layOver(weights, GroundLayer.Sand, getBandAmount(sandHeight, height));
    if (snowHeight) layOver(weights, GroundLayer.Snow, getBandAmount(snowHeight, height));
    let pathAmount = 0;
    for (const path of getPaths(x, z)) {
      const measurement = measureSegment(path, x, z);
      const halfWidth = path.width / 2;
      const distance = Math.hypot(measurement[0] ?? 0, measurement[1] ?? 0);
      pathAmount = Math.max(pathAmount, 1 - MathUtils.smoothstep(distance, halfWidth, halfWidth + pathFalloff));
    }
    layOver(weights, GroundLayer.Path, pathAmount);
    if (rockSlope) layOver(weights, GroundLayer.Rock, getBandAmount(rockSlope, slope));
    return weights;
  };
};
