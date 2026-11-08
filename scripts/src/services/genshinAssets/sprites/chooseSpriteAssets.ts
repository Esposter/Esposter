import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";

// One index row for each name the index holds, its sprite where it holds one, since a sprite is the picture the game
// Draws and its texture the whole atlas, and the first row of its kind otherwise. A name it holds neither of is missing
export const chooseSpriteAssets = (
  names: readonly string[],
  assets: readonly IndexedAsset[],
): { assets: IndexedAsset[]; missing: string[] } => {
  const chosen = new Map<string, IndexedAsset>();
  for (const asset of assets) {
    const current = chosen.get(asset.name);
    if (!current || (asset.type === AssetType.Sprite && current.type !== AssetType.Sprite))
      chosen.set(asset.name, asset);
  }
  return {
    assets: names.flatMap((name) => chosen.get(name) ?? []),
    missing: names.filter((name) => !chosen.has(name)),
  };
};
