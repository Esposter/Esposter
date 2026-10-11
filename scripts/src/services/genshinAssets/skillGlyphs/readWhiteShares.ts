import type { Sharp } from "sharp";

import { DISC_SHADE_QUANTILE } from "#src/services/genshinAssets/skillGlyphs/constants";
import { getPercentile } from "#src/services/shared/getPercentile";

const OPAQUE_ALPHA = 255;
const WHITE = 255;
// Each pixel of an icon's square as its share of white over the disc's own shade along its row, since the disc is graded
// From top to bottom: 0 on the disc, 1 on white. A pixel outside the disc, or on its antialiased rim, has none (-1)
export const readWhiteShares = async (image: Sharp, size: number): Promise<Float32Array> => {
  const data = await image.raw().toBuffer();
  const getLuminance = (offset: number) =>
    0.2126 * (data[offset] ?? 0) + 0.7152 * (data[offset + 1] ?? 0) + 0.0722 * (data[offset + 2] ?? 0);
  const shares = new Float32Array(size * size).fill(-1);
  for (let y = 0; y < size; y++) {
    const offsets = Array.from({ length: size }, (_value, x) => (y * size + x) * 4).filter(
      (offset) => data[offset + 3] === OPAQUE_ALPHA,
    );
    const shade = getPercentile(
      offsets.map((offset) => getLuminance(offset)),
      DISC_SHADE_QUANTILE,
    );
    for (const offset of offsets) shares[offset / 4] = (getLuminance(offset) - shade) / (WHITE - shade);
  }
  return shares;
};
