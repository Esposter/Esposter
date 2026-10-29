import type { Texture } from "#src/models/genshinAssets/fit/Texture";

import { readTexture } from "#src/services/genshinAssets/fit/readTexture";
import { existsSync } from "node:fs";

export const readOptionalTexture = (path: string): Promise<Texture | undefined> =>
  existsSync(path) ? readTexture(path) : Promise.resolve(undefined);
