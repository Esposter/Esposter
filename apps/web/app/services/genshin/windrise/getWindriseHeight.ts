import {
  DETAIL_HEIGHT,
  DETAIL_SCALE,
  EAST_OPENING,
  KNOLL_HEIGHT,
  KNOLL_RADIUS,
  LAKE_CENTER_X,
  LAKE_CENTER_Z,
  LAKE_DEPTH,
  LAKE_RADIUS,
  RIM_END_RADIUS,
  RIM_HEIGHT,
  RIM_START_RADIUS,
  WINDRISE_SEED,
} from "@/services/genshin/windrise/constants";
import { createSimplexNoise } from "genshin-engine";

const noise = createSimplexNoise(WINDRISE_SEED);
const smoothstep = (edge0: number, edge1: number, value: number): number => {
  const progress = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return progress * progress * (3 - 2 * progress);
};
// The valley's ground: a round knoll under the oak, hills rising around the valley's edge but falling away to the
// East, a lake's bowl beyond them, and gentle rolls between. The rolls fade out on the knoll's top so the oak and the
// Statue stand level
export const getWindriseHeight = (x: number, z: number): number => {
  const radius = Math.hypot(x, z);
  const knoll = KNOLL_HEIGHT * Math.exp(-((radius / KNOLL_RADIUS) ** 2));
  const eastness = radius === 0 ? 0 : x / radius;
  const opening = 1 - EAST_OPENING * smoothstep(0.3, 0.9, eastness);
  const rim = RIM_HEIGHT * smoothstep(RIM_START_RADIUS, RIM_END_RADIUS, radius) * opening;
  const lakeDistance = Math.hypot(x - LAKE_CENTER_X, z - LAKE_CENTER_Z);
  const lake = LAKE_DEPTH * (1 - smoothstep(LAKE_RADIUS * 0.4, LAKE_RADIUS, lakeDistance));
  const detailFade = Math.min(radius / KNOLL_RADIUS, 1);
  return knoll + rim - lake + DETAIL_HEIGHT * detailFade * noise(x / DETAIL_SCALE, z / DETAIL_SCALE);
};
