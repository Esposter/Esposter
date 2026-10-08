import type { PlantedTerrainTile } from "#src/models/PlantedTerrainTile";

import water from "#src/data/windrise/water.json";
import {
  FLOWER_CANDIDATE_COUNT,
  FLOWER_COLORS,
  FLOWER_MAX_SIZE,
  FLOWER_MIN_GRASS,
  FLOWER_MIN_SIZE,
  FLOWER_SPACING,
  WINDRISE_GROUND_PAINT,
} from "#src/services/windrise/constants";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import {
  computeScatterPoints,
  createGroundLayerWeights,
  createSeededRandom,
  getTerrainTileColumn,
  getTerrainTileRow,
  GroundLayer,
} from "genshin-engine";
import { Color, MathUtils, Matrix4, Quaternion, Vector3 } from "three";

// How far either side of a point its slope is read across, in metres
const SLOPE_REACH = 0.5;
const getWeights = createGroundLayerWeights(WINDRISE_GROUND_PAINT);
// Converted to the linear working space once
const flowerColors = FLOWER_COLORS.map((flowerColor) => new Color(flowerColor));
const UP = new Vector3(0, 1, 0);
const matrix = new Matrix4();
const rotation = new Quaternion();
const scale = new Vector3();
const translation = new Vector3();
// How steep the ground is at a point, from 0 flat to 1 sheer, as the terrain reads a vertex's
const getSlope = (x: number, z: number): number => {
  const acrossX = getWorldHeight(x - SLOPE_REACH, z) - getWorldHeight(x + SLOPE_REACH, z);
  const acrossZ = getWorldHeight(x, z - SLOPE_REACH) - getWorldHeight(x, z + SLOPE_REACH);
  const up = SLOPE_REACH * 2;
  return 1 - up / Math.hypot(acrossX, up, acrossZ);
};
// Windrise's flowers on one finest tile, scattered over its square where the ground is grass above the water, the
// Tile's key their seed, so the same tile always grows the same flowers. Each stands on the ground, turned and sized
// At random, in one of the palette's colours
export const computeWindrisePlants = (
  key: number,
  size: number,
): Pick<PlantedTerrainTile, "plantColors" | "plantMatrices"> => {
  const left = getTerrainTileColumn(key) * size;
  const back = getTerrainTileRow(key) * size;
  const points = computeScatterPoints({
    candidateCount: FLOWER_CANDIDATE_COUNT,
    checkIsAccepted: (x, z) => {
      const worldX = left + x;
      const worldZ = back + z;
      const height = getWorldHeight(worldX, worldZ);
      if (height < water.level) return false;
      const weights = getWeights(height, getSlope(worldX, worldZ), worldX, worldZ);
      return weights[GroundLayer.Grass] >= FLOWER_MIN_GRASS;
    },
    seed: key,
    size,
    spacing: FLOWER_SPACING,
  });
  const plantCount = points.length / 2;
  const plantMatrices = new Float32Array(plantCount * 16);
  const plantColors = new Float32Array(plantCount * 3);
  const random = createSeededRandom(key + 1);
  for (let plantIndex = 0; plantIndex < plantCount; plantIndex++) {
    const x = points[plantIndex * 2] ?? 0;
    const z = points[plantIndex * 2 + 1] ?? 0;
    translation.set(x, getWorldHeight(left + x, back + z), z);
    rotation.setFromAxisAngle(UP, random() * Math.PI * 2);
    scale.setScalar(MathUtils.lerp(FLOWER_MIN_SIZE, FLOWER_MAX_SIZE, random()));
    matrix.compose(translation, rotation, scale).toArray(plantMatrices, plantIndex * 16);
    flowerColors[Math.floor(random() * flowerColors.length)]?.toArray(plantColors, plantIndex * 3);
  }
  return { plantColors, plantMatrices };
};
