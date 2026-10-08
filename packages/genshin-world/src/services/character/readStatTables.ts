import type { StatTables } from "#src/models/character/StatTables";

import { parseStatTables } from "#src/services/character/parseStatTables";

// The game's stat tables, as `pnpm -C scripts genshin:assets stats` writes them from its own, each checked against its
// Schema as it arrives. Each is imported on demand, so the build splits it into a chunk of its own rather than the
// Package's, which every page of the opening downloads
export const readStatTables = async (): Promise<StatTables> => {
  const [
    artifactExpMaterials,
    artifactMainAffixCurves,
    artifactMainAffixPools,
    artifactRarities,
    artifactSets,
    characterGrowCurves,
    characters,
    weaponGrowCurves,
    weapons,
  ] = await Promise.all([
    import("#src/generated/stats/artifactExpMaterials.json"),
    import("#src/generated/stats/artifactMainAffixCurves.json"),
    import("#src/generated/stats/artifactMainAffixPools.json"),
    import("#src/generated/stats/artifactRarities.json"),
    import("#src/generated/stats/artifactSets.json"),
    import("#src/generated/stats/characterGrowCurves.json"),
    import("#src/generated/stats/characters.json"),
    import("#src/generated/stats/weaponGrowCurves.json"),
    import("#src/generated/stats/weapons.json"),
  ]);
  return parseStatTables({
    artifactExpMaterials: artifactExpMaterials.default,
    artifactMainAffixCurves: artifactMainAffixCurves.default,
    artifactMainAffixPools: artifactMainAffixPools.default,
    artifactRarities: artifactRarities.default,
    artifactSets: artifactSets.default,
    characterGrowCurves: characterGrowCurves.default,
    characters: characters.default,
    weaponGrowCurves: weaponGrowCurves.default,
    weapons: weapons.default,
  });
};
