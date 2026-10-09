import { PREFAB_ROOT_MAP } from "#src/services/genshinAssets/world/constants";

// Each path a prefab named `stem` may sit at, its folder being its root, its code (the word after the root's), its
// Category, then Common or the words after the category as sub folders, in the shape the community's 2.6 index holds
// For Liyue and Inazuma (`Area_Ly_Build_LYG_*` is `Build/LYG`). Names that are not of that shape have no candidate
export const getPrefabPathCandidates = (stem: string): string[] => {
  const words = stem.split("_");
  const [prefix = "", code = "", category = ""] = words;
  const root = PREFAB_ROOT_MAP[prefix];
  if (!root || !category) return [];
  const categoryFolder = `${root}/${code}/${category}`;
  const folders = new Set([`${categoryFolder}/Common`, categoryFolder]);
  for (let end = 4; end <= words.length; end++) folders.add(`${categoryFolder}/${words.slice(3, end).join("_")}`);
  return Array.from(folders, (folder) => `${folder}/${stem}`);
};
