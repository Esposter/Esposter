import {
  GRASS_DARK_COLOR,
  GRASS_LIGHT_COLOR,
  ROCK_COLOR,
  ROCK_SLOPE,
  WINDRISE_SEED,
} from "#src/services/windrise/constants";
import { createSimplexNoise } from "genshin-engine";
import { Color } from "three";

const GRASS_PATCH_SCALE = 18;
const noise = createSimplexNoise(WINDRISE_SEED + 1);
// Converted to the linear working space once, so a vertex's colour is only a blend
const GRASS_LIGHT = new Color(GRASS_LIGHT_COLOR);
const GRASS_DARK = new Color(GRASS_DARK_COLOR);
const ROCK = new Color(ROCK_COLOR);
const blended = new Color();
// Grass in patches of lighter and darker green, and rock where the ground turns steep
export const writeWindriseColor = (
  colors: Float32Array,
  offset: number,
  _height: number,
  slope: number,
  x: number,
  z: number,
): void => {
  const patch = (noise(x / GRASS_PATCH_SCALE, z / GRASS_PATCH_SCALE) + 1) / 2;
  blended.lerpColors(GRASS_DARK, GRASS_LIGHT, patch);
  if (slope > ROCK_SLOPE) blended.lerp(ROCK, Math.min((slope - ROCK_SLOPE) * 4, 1));
  colors[offset] = blended.r;
  colors[offset + 1] = blended.g;
  colors[offset + 2] = blended.b;
};
