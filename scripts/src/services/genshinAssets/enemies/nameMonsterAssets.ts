import type { MonsterAssetNames } from "#src/models/genshinAssets/enemies/MonsterAssetNames";
import type { MonsterAssetRow } from "#src/models/genshinAssets/enemies/MonsterAssetRow";

import { getPathHashKey } from "#src/services/genshinAssets/world/getPathHashKey";

// The path each of a monster row's prefab, controller and combat config hashes names, looked up in the path names keyed
// As `getPathHashKey` keys a hash. A hash no path name holds is counted as unnamed and named by nothing, so no path is
// Guessed for it, and a hash the row leaves out is none and is not counted
export const nameMonsterAssets = (row: MonsterAssetRow, pathNames: ReadonlyMap<string, string>): MonsterAssetNames => {
  const lookUp = (hash: string | undefined): string | undefined =>
    hash === undefined ? undefined : pathNames.get(getPathHashKey(hash));
  const combatConfig = lookUp(row.combatConfigHash);
  const controller = lookUp(row.controllerPathHash);
  const prefab = lookUp(row.prefabPathHash);
  const unnamed = [
    [row.combatConfigHash, combatConfig],
    [row.controllerPathHash, controller],
    [row.prefabPathHash, prefab],
  ].filter(([hash, name]) => hash !== undefined && name === undefined).length;
  return { combatConfig, controller, prefab, unnamed };
};
