import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { readWeaponRoots } from "#src/services/genshinAssets/weapons/readWeaponRoots";

// The roots a component is exported from: the map's own, except the weapons', which `weapon-roots` publishes and which
// Are read through the lock
export const readComponentRoots = async (component: DerivedAssetComponent): Promise<AssetRoot[]> =>
  component === DerivedAssetComponent.Weapons ? readWeaponRoots() : (DerivedAssetComponentMap[component].roots ?? []);
