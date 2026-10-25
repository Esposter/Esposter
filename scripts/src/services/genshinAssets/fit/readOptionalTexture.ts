import type { Texture } from "#src/models/genshinAssets/fit/Texture";

import { existsSync } from "node:fs";
import sharp from "sharp";

export const readOptionalTexture = (path: string): Promise<Texture | undefined> =>
  existsSync(path) ? sharp(path).raw().toBuffer({ resolveWithObject: true }) : Promise.resolve(undefined);
