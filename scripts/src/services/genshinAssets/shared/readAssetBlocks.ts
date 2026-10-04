import { readIndexedAssets } from "#src/services/genshinAssets/shared/readIndexedAssets";

// The blocks holding every asset whose name matches, from the asset index, each relative to the blocks folder
export const readAssetBlocks = async (namePattern: string): Promise<string[]> => {
  const pattern = new RegExp(namePattern, "u");
  const assets = await readIndexedAssets(({ name }) => pattern.test(name));
  return [...new Set(assets.map(({ block }) => block))].toSorted();
};
