import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { applySpawns } from "#src/services/genshinAssets/shared/applySpawns";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readSceneLayout } from "#src/services/genshinAssets/shared/readSceneLayout";

// A component's layout dumps read as its scene, with every prefab its scripts spawn hung from its anchor
export const readComponentLayout = async (
  component: DerivedAssetComponent,
): Promise<Awaited<ReturnType<typeof readSceneLayout>>> => {
  const layout = await readSceneLayout(getComponentDirectory(component).layout);
  return { ...layout, objects: applySpawns(layout.objects, DerivedAssetComponentMap[component].spawns ?? []) };
};
