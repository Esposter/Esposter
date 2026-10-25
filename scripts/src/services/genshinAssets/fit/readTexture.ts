import type { Texture } from "#src/models/genshinAssets/fit/Texture";

import sharp from "sharp";

export const readTexture = (path: string): Promise<Texture> => sharp(path).raw().toBuffer({ resolveWithObject: true });
