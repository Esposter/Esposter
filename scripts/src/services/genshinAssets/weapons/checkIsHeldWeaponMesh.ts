import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { HELD_WEAPON_MESH_REGEX } from "#src/services/genshinAssets/weapons/constants";

// Whether an indexed asset is a held weapon's mesh, the one rule the weapon mesh map and the weapon roots both keep to
export const checkIsHeldWeaponMesh = ({ name, type }: IndexedAsset): boolean =>
  type === AssetType.Mesh && HELD_WEAPON_MESH_REGEX.test(name);
