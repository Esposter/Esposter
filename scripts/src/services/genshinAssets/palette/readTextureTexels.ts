import type { Vector } from "#src/models/shared/Vector";

import { toLinear } from "#src/services/shared/toLinear";
import sharp from "sharp";

// The texels a diffuse texture is reduced to before its colours are read, the same size a fit takes its albedo at
const PALETTE_SAMPLE_SIZE = 64;
const CHANNEL_MAXIMUM = 255;

// The linear colour of every texel of a diffuse texture its alpha covers where it has one, so a cut-out's transparent
// Texels never colour its family. A texture with fewer than three channels paints its texels grey, from its first
export const readTextureTexels = async (texturePath: string): Promise<Vector[]> => {
  const { data, info } = await sharp(texturePath)
    .resize(PALETTE_SAMPLE_SIZE, PALETTE_SAMPLE_SIZE, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const hasAlpha = info.channels === 2 || info.channels === 4;
  const colourChannels = hasAlpha ? info.channels - 1 : info.channels;
  const texels: Vector[] = [];
  for (let texel = 0; texel < info.width * info.height; texel++) {
    const offset = texel * info.channels;
    if (hasAlpha && (data[offset + info.channels - 1] ?? 0) === 0) continue;
    texels.push(
      ([0, 1, 2] as const).map((channel) =>
        toLinear((data[offset + Math.min(channel, colourChannels - 1)] ?? 0) / CHANNEL_MAXIMUM),
      ) as Vector,
    );
  }
  return texels;
};
