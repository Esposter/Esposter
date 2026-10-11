import type { Vector } from "#src/models/shared/Vector";

import { toLinear } from "#src/services/shared/toLinear";
import sharp from "sharp";

// The texels a diffuse texture is reduced to before its colours are read, the same size a fit takes its albedo at
const PALETTE_SAMPLE_SIZE = 64;
const CHANNEL_MAXIMUM = 255;

// The linear colour of every texel of a set of diffuse textures, pooled, so a family's colour counts each texture's
// Texels alike whatever its size
export const readFamilyTexels = async (texturePaths: readonly string[]): Promise<Vector[]> => {
  const texels: Vector[] = [];
  for (const texturePath of texturePaths) {
    // oxlint-disable-next-line no-await-in-loop -- one texture is read at a time
    const { data, info } = await sharp(texturePath)
      .resize(PALETTE_SAMPLE_SIZE, PALETTE_SAMPLE_SIZE, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    for (let texel = 0; texel < info.width * info.height; texel++) {
      const offset = texel * info.channels;
      texels.push([
        toLinear((data[offset] ?? 0) / CHANNEL_MAXIMUM),
        toLinear((data[offset + 1] ?? 0) / CHANNEL_MAXIMUM),
        toLinear((data[offset + 2] ?? 0) / CHANNEL_MAXIMUM),
      ]);
    }
  }
  return texels;
};
