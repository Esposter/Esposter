import {
  DETAIL_HEIGHT,
  DETAIL_SCALE,
  KNOLL_HEIGHT,
  KNOLL_RADIUS,
  RIM_END_RADIUS,
  RIM_HEIGHT,
  RIM_START_RADIUS,
  WINDRISE_SEED,
} from "@/services/genshin/windrise/constants";
import { createSimplexNoise } from "genshin-engine";

const noise = createSimplexNoise(WINDRISE_SEED);
// The valley's ground: a round knoll under the oak, hills rising around the valley's edge, and gentle rolls between.
// The rolls fade out on the knoll's top so the oak and the statue stand level
export const getWindriseHeight = (x: number, z: number): number => {
  const radius = Math.hypot(x, z);
  const knoll = KNOLL_HEIGHT * Math.exp(-((radius / KNOLL_RADIUS) ** 2));
  const rimProgress = Math.min(Math.max((radius - RIM_START_RADIUS) / (RIM_END_RADIUS - RIM_START_RADIUS), 0), 1);
  const rim = RIM_HEIGHT * rimProgress * rimProgress * (3 - 2 * rimProgress);
  const detailFade = Math.min(radius / KNOLL_RADIUS, 1);
  return knoll + rim + DETAIL_HEIGHT * detailFade * noise(x / DETAIL_SCALE, z / DETAIL_SCALE);
};
