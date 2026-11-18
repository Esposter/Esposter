import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { GENSHIN_ANIMESTUDIO_OPTIONS } from "#src/services/genshinAssets/shared/constants";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";

// The name of each animation clip the asset index holds under one of the path IDs given, by its path ID as source text.
// A clip a controller names in another block is found all the same, since the index lists every block's clips
export const readAnimationClipNames = async (pathIds: ReadonlySet<string>): Promise<Map<string, string>> => {
  const assets = await readIndexedAssets(
    (asset) => asset.type === AssetType.AnimationClip && pathIds.has(asset.pathId),
    GENSHIN_ANIMESTUDIO_OPTIONS,
  );
  return new Map(assets.map(({ name, pathId }) => [pathId, name]));
};
