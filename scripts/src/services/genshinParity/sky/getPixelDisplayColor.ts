import type { Vector } from "#src/models/shared/Vector";

import { BYTE } from "#src/services/shared/constants";
import { toLinear } from "#src/services/shared/toLinear";

// A pixel of a raw RGB shot as the screen shows it, in linear channels before the display's encoding
export const getPixelDisplayColor = (data: Buffer, pixel: number): Vector => [
  toLinear((data[pixel * 3] ?? 0) / BYTE),
  toLinear((data[pixel * 3 + 1] ?? 0) / BYTE),
  toLinear((data[pixel * 3 + 2] ?? 0) / BYTE),
];
