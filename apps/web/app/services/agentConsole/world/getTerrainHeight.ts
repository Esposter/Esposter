import {
  ROOM_BLEND_DISTANCE,
  ROOM_DEPTH,
  ROOM_FLAT_MARGIN,
  ROOM_WIDTH,
  TERRAIN_AMPLITUDE,
  TERRAIN_BASE_HEIGHT,
  TERRAIN_OCTAVE_COUNT,
  TERRAIN_SCALE,
  WORLD_HEIGHT,
  WORLD_SEED,
} from "@/services/agentConsole/world/constants";
import { createSimplexNoise } from "@/services/agentConsole/world/createSimplexNoise";
import { MathUtils } from "three";

const heightNoise = createSimplexNoise(WORLD_SEED);
// How many voxels tall the ground stands in a column: octaves of noise summed, each twice the detail and half the
// Height of the last, and flattened to the room's floor around the room so it stands on level ground. Never less than
// One, so the ground has no holes, and never the world's full height, so the sky over it is open
export const getTerrainHeight = (x: number, z: number) => {
  let noise = 0;
  let amplitude = 1;
  let amplitudeSum = 0;
  for (let octave = 0; octave < TERRAIN_OCTAVE_COUNT; octave++) {
    const frequency = 2 ** octave / TERRAIN_SCALE;
    noise += amplitude * heightNoise(x * frequency, z * frequency);
    amplitudeSum += amplitude;
    amplitude /= 2;
  }
  const noiseHeight = TERRAIN_BASE_HEIGHT + (TERRAIN_AMPLITUDE * noise) / amplitudeSum;
  // How far the column is outside the room's footprint, which the ground rises from its floor over
  const roomDistance = Math.hypot(Math.max(-x, x - (ROOM_WIDTH - 1), 0), Math.max(-z, z - (ROOM_DEPTH - 1), 0));
  const blend = MathUtils.clamp((roomDistance - ROOM_FLAT_MARGIN) / ROOM_BLEND_DISTANCE, 0, 1);
  return MathUtils.clamp(Math.round(MathUtils.lerp(1, noiseHeight, blend)), 1, WORLD_HEIGHT - 1);
};
