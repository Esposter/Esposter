import type { Vector } from "#src/models/shared/Vector";

import { getPixelDisplayColor } from "#src/services/genshinParity/sky/getPixelDisplayColor";
import { toSceneColor } from "genshin-engine";
import { Color } from "three";

// A pixel of a raw RGB shot as the scene colour that tone maps to it
export const getPixelSceneColor = (data: Buffer, pixel: number): Vector => {
  const [red, green, blue] = toSceneColor(new Color(...getPixelDisplayColor(data, pixel))).toArray();
  return [red ?? 0, green ?? 0, blue ?? 0];
};
