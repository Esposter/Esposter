import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

// The blocks a second pass searches for the tiles the first pass missed: each block naming a terrain asset in the index,
// Once and in the index's order, but none the first pass already searched
export const getTerrainSearchBlocks = (
  terrainAssets: readonly Pick<IndexedAsset, "block">[],
  searchedBlocks: readonly string[],
): string[] => {
  const searched = new Set(searchedBlocks);
  return [...new Set(terrainAssets.map(({ block }) => block))].filter((block) => !searched.has(block));
};
