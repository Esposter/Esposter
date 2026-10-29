import type { Texture } from "#src/models/genshinAssets/fit/Texture";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readTexture } from "#src/services/genshinAssets/fit/readTexture";
import { CUTOFF_PROPERTY } from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readAssetNames } from "#src/services/genshinAssets/shared/readAssetNames";
import { readComponentMaterials } from "#src/services/genshinAssets/shared/readComponentMaterials";
import { toDiffusePath } from "#src/services/genshinAssets/shared/toDiffusePath";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";

// The texture a placed material cuts its cards with and the alpha it cuts them at, read off its export: its diffuse and
// Its cutoff, each found by its path ID through the asset index's names
export const readCutTexture = async (materialPathId: string): Promise<{ cutoff: number; texture: Texture }> => {
  const materials = await readComponentMaterials(DerivedAssetComponent.Windrise);
  const pathIdNameMap = await readAssetNames(
    new Set([
      materialPathId,
      ...materials.flatMap(({ textures }) => Object.values(textures).map(({ pathId }) => pathId)),
    ]),
  );
  const material = materials.find(({ name }) => name === pathIdNameMap.get(materialPathId));
  const textureDirectory = join(getComponentDirectory(DerivedAssetComponent.Windrise).assets, AssetType.Texture2D);
  const path = toDiffusePath(textureDirectory, material, pathIdNameMap);
  const cutoff = material?.floats[CUTOFF_PROPERTY];
  if (path === undefined || cutoff === undefined)
    throw new InvalidOperationError(Operation.Read, materialPathId, "has no diffuse texture or cutoff exported");
  return { cutoff, texture: await readTexture(path) };
};
