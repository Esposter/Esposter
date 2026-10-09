import type { StatTables } from "#src/models/character/StatTables";

import { parseStatTables } from "#src/services/character/parseStatTables";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The game's stat tables, as `pnpm -C scripts genshin:assets stats` writes them from its own, each fetched by its key
// From the hosted game data and checked against its schema as it arrives
export const readStatTables = async (gameDataBaseUrl: string): Promise<StatTables> => {
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
    readGameData(gameDataBaseUrl, "stats/artifactExpMaterials", z.unknown()),
    readGameData(gameDataBaseUrl, "stats/artifactMainAffixCurves", z.unknown()),
    readGameData(gameDataBaseUrl, "stats/artifactMainAffixPools", z.unknown()),
    readGameData(gameDataBaseUrl, "stats/artifactRarities", z.unknown()),
    readGameData(gameDataBaseUrl, "stats/artifactSets", z.unknown()),
    readGameData(gameDataBaseUrl, "stats/characterGrowCurves", z.unknown()),
    readGameData(gameDataBaseUrl, "stats/characters", z.unknown()),
    readGameData(gameDataBaseUrl, "stats/weaponGrowCurves", z.unknown()),
    readGameData(gameDataBaseUrl, "stats/weapons", z.unknown()),
  ]);
  return parseStatTables({
    artifactExpMaterials,
    artifactMainAffixCurves,
    artifactMainAffixPools,
    artifactRarities,
    artifactSets,
    characterGrowCurves,
    characters,
    weaponGrowCurves,
    weapons,
  });
};
