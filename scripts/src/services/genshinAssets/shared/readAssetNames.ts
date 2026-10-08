import { readIndexedAssets } from "#src/services/genshinAssets/shared/readIndexedAssets";

// The name of every asset by its path ID, as the asset index names it: a material a placement draws with, a texture a
// Material's slot holds, each a reference into another file
export const readAssetNames = async (pathIds: ReadonlySet<string>): Promise<Map<string, string>> => {
  const indexed = await readIndexedAssets(({ pathId }) => pathIds.has(pathId));
  return new Map(indexed.map(({ name, pathId }) => [pathId, name]));
};
