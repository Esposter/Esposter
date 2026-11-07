import type { SpriteCut } from "#src/models/genshinAssets/sprites/SpriteCut";

import sharp from "sharp";

// Every sprite cut from one atlas, the atlas decoded once for all of them. Unity measures a rectangle up from the atlas's
// bottom edge, so its top is the atlas's height less the rectangle's own top-to-bottom reach, and its edges are whole pixels
export const cutSprites = async (atlasPath: string, cuts: readonly SpriteCut[]): Promise<void> => {
  const { data, info } = await sharp(atlasPath).raw().toBuffer({ resolveWithObject: true });
  await Promise.all(
    cuts.map(({ outputPath, rectangle: { height, width, x, y } }) =>
      sharp(data, { raw: info })
        .extract({
          height: Math.round(height),
          left: Math.round(x),
          top: Math.round(info.height - y - height),
          width: Math.round(width),
        })
        .png()
        .toFile(outputPath),
    ),
  );
};
