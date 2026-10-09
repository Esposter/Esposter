import type { IndexedAsset } from "#src/models/genshinAssets/shared/IndexedAsset";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { NAMECARD_ART_PREFIX, NAMECARD_ICON_PREFIX } from "#src/services/genshinAssets/namecards/constants";

// Whether an index row is a namecard's art or icon as its texture: the index names each one twice, as the texture and as
// The sprite cut from it, and only the texture is exported
export const checkNamecardAsset = ({ name, type }: IndexedAsset): boolean =>
  type === AssetType.Texture2D && (name.startsWith(NAMECARD_ART_PREFIX) || name.startsWith(NAMECARD_ICON_PREFIX));
