import type { MaterialValues } from "#src/models/genshinAssets/shared/MaterialValues";

import { MAIN_TEXTURE_SLOT } from "#src/services/genshinAssets/shared/constants";
import { existsSync } from "node:fs";
import { join } from "node:path";

// The exported diffuse texture a material draws with, if it was exported: its main slot's texture, named through the
// Asset index's names by path ID, in the component's texture folder
export const toDiffusePath = (
  textureDirectory: string,
  material: MaterialValues | undefined,
  pathIdNameMap: ReadonlyMap<string, string>,
): string | undefined => {
  const textureName = pathIdNameMap.get(material?.textures[MAIN_TEXTURE_SLOT]?.pathId ?? "");
  const path = textureName === undefined ? undefined : join(textureDirectory, `${textureName}.png`);
  return path && existsSync(path) ? path : undefined;
};
