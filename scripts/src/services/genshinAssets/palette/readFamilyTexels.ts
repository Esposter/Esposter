import type { Vector } from "#src/models/shared/Vector";

import { BYTE } from "#src/services/shared/constants";
import { toLinear } from "#src/services/shared/toLinear";
import sharp from "sharp";

// The texels a diffuse texture is reduced to before its colours are read, the same size a fit takes its albedo at
const PALETTE_SAMPLE_SIZE = 64;

// The linear colour of every texel of a set of diffuse textures, pooled, so a family's colour counts each texture's
// Texels alike whatever its size. A texel its alpha covers at zero is skipped, so a cut-out's transparent texels never
// Colour the family, and a texture with fewer than three channels paints its texels grey, from its first channel
export const readFamilyTexels = async (texturePaths: readonly string[]): Promise<Vector[]> => {
  const texelsPerTexture = await Promise.all(
    texturePaths.map(async (texturePath) => {
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
        const colourAt = (channel: number) =>
          toLinear((data[offset + Math.min(channel, colourChannels - 1)] ?? 0) / BYTE);
        texels.push([colourAt(0), colourAt(1), colourAt(2)]);
      }
      return texels;
    }),
  );
  return texelsPerTexture.flat();
};
