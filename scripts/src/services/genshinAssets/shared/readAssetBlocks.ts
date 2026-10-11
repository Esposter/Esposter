import { GENSHIN_ANIMESTUDIO_OPTIONS } from "#src/services/genshinAssets/shared/constants";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";

// The blocks holding every asset whose name matches, from the asset index, each relative to the blocks folder
export const readAssetBlocks = async (namePattern: string): Promise<string[]> => {
  const pattern = new RegExp(namePattern, "u");
  const assets = await readIndexedAssets(({ name }) => pattern.test(name), GENSHIN_ANIMESTUDIO_OPTIONS);
  return [...new Set(assets.map(({ block }) => block))].toSorted();
};
