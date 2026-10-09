import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SceneLayout } from "#src/models/genshinAssets/shared/SceneLayout";

import { applySpawns } from "#src/services/genshinAssets/shared/applySpawns";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readSceneLayout } from "#src/services/genshinAssets/shared/readSceneLayout";
import { withFinalizerAsync } from "@esposter/shared";

// The layout reads still in flight, by component. A component's fit starts several reads at once, each needing the
// Layout first, and Windrise's dumps are about 190,000 files, so they share one read rather than parsing them four
// Times at once. The entry is dropped as the read settles, so no layout outlives the readers holding it
const componentPendingLayoutMap = new Map<DerivedAssetComponent, Promise<SceneLayout>>();

// A component's layout dumps read as its scene, with every prefab its scripts spawn hung from its anchor
export const readComponentLayout = (component: DerivedAssetComponent): Promise<SceneLayout> => {
  const pendingLayout = componentPendingLayoutMap.get(component);
  if (pendingLayout) return pendingLayout;
  const layout = withFinalizerAsync(
    async () => {
      const sceneLayout = await readSceneLayout(getComponentDirectory(component).layout);
      return {
        ...sceneLayout,
        objects: applySpawns(sceneLayout.objects, DerivedAssetComponentMap[component].spawns ?? []),
      };
    },
    () => {
      componentPendingLayoutMap.delete(component);
    },
  );
  componentPendingLayoutMap.set(component, layout);
  return layout;
};
