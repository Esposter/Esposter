import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";

// Whether an index row is one of the named sprites or textures, in the block when one is named: the index names a sprite
// And the texture it is cut from alike, and either is kept, since a name is looked up in both
export const checkSpriteAsset =
  (names: ReadonlySet<string>, block?: string) =>
  ({ block: assetBlock, name, type }: IndexedAsset): boolean =>
    names.has(name) &&
    (block === undefined || assetBlock === block) &&
    (type === AssetType.Sprite || type === AssetType.Texture2D);
