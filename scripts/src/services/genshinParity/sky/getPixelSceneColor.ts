import type { Vector } from "#src/models/shared/Vector";

import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { BYTE } from "#src/services/shared/constants";
import { toLinear } from "#src/services/shared/toLinear";
import { toSceneColor } from "genshin-engine";
import { Color } from "three";

// A pixel of a raw RGB shot as the scene colour that tone maps to it
export const getPixelSceneColor = (data: Buffer, pixel: number): Vector =>
  toSceneColor(
    new Color(...CHANNELS.map((channel) => toLinear((data[pixel * 3 + channel] ?? 0) / BYTE))),
  ).toArray() as Vector;
