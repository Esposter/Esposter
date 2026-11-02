import type { WorldLevelRow } from "#src/models/adventureRank/WorldLevelRow";
import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { RegionData } from "#src/models/world/RegionData";
import type { MaybeRefOrGetter } from "vue";

import { EnemyType } from "#src/models/enemy/EnemyType";
import { checkIsEnemyRespawned } from "#src/services/enemy/checkIsEnemyRespawned";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getSpawnKey } from "#src/services/enemy/getSpawnKey";
import { watchImmediate } from "@vueuse/core";
import { toValue } from "vue";

// A camp spawns as its region's data arrives, each member whose respawn time has come, and is dropped as it leaves,
// So an enemy comes back only on a load, never in view. An outcrop's camp spawns whole as its fight starts, so no
// Member's respawn time applies to it
export const useEnemySpawns = ({
  bossDefeatMap,
  enemyMap,
  enemyRespawnMap,
  enemyTables,
  getWorldNow,
  lastTeleportAts,
  onLoad,
  onRespawn,
  outcropCamps,
  regionDataMap,
  trounceBlossoms,
  worldLevel,
  worldLevelRows,
}: {
  bossDefeatMap: ReadonlyMap<string, string>;
  enemyMap: Map<string, Enemy>;
  enemyRespawnMap: MaybeRefOrGetter<ReadonlyMap<string, string>>;
  enemyTables: MaybeRefOrGetter<EnemyTables>;
  getWorldNow: () => Temporal.Instant;
  lastTeleportAts: MaybeRefOrGetter<ReadonlyMap<string, Temporal.Instant>>;
  onLoad: () => void;
  onRespawn: (spawnKey: string) => void;
  outcropCamps: MaybeRefOrGetter<EnemyCamp[]>;
  regionDataMap: MaybeRefOrGetter<ReadonlyMap<string, RegionData>>;
  trounceBlossoms: MaybeRefOrGetter<ReadonlyMap<string, TrounceBlossom>>;
  worldLevel: MaybeRefOrGetter<number>;
  worldLevelRows: MaybeRefOrGetter<readonly WorldLevelRow[]>;
}) => {
  // The enemy types of a camp's members, by which a defeated member comes back
  const getCampEnemyTypes = (members: EnemyCamp["members"]) =>
    members.map(({ enemyKindId }) => getEnemyKind(toValue(enemyTables).enemyKindMap, enemyKindId).enemyType);
  // When each spawn was last defeated, kept for the page's life until a saved game keeps it
  const spawnKeyDefeatedAtMap = new Map<string, Temporal.Instant>();
  // The bosses the save holds as defeated, so a reload keeps each one down until its return
  for (const [spawnKey, defeatedAt] of bossDefeatMap)
    spawnKeyDefeatedAtMap.set(spawnKey, Temporal.Instant.from(defeatedAt));
  // Every camp of every region whose data has arrived
  const getEnemyCamps = () => [...toValue(regionDataMap).values()].flatMap(({ enemyCamps }) => enemyCamps);
  const loadedCampIds = new Set<string>();
  let spawnedWorldLevel = toValue(worldLevel);
  watchImmediate(
    () => [toValue(worldLevel), getEnemyCamps(), toValue(outcropCamps)] as const,
    ([currentWorldLevel, enemyCamps, fightingCamps]) => {
      onLoad();
      if (currentWorldLevel !== spawnedWorldLevel) {
        spawnedWorldLevel = currentWorldLevel;
        enemyMap.clear();
        loadedCampIds.clear();
      }
      const campIds = new Set([...enemyCamps, ...fightingCamps].map(({ id }) => id));
      for (const [spawnKey, { campId }] of enemyMap) if (!campIds.has(campId)) enemyMap.delete(spawnKey);
      for (const campId of loadedCampIds.difference(campIds)) loadedCampIds.delete(campId);
      const now = getWorldNow();
      for (const { areaId, id, members } of enemyCamps) {
        if (loadedCampIds.has(id)) continue;
        loadedCampIds.add(id);
        const campEnemyTypes = getCampEnemyTypes(members);
        for (const member of members) {
          const spawnKey = getSpawnKey(id, member.id);
          const savedRespawnAt = toValue(enemyRespawnMap).get(spawnKey);
          if (savedRespawnAt === undefined) {
            const defeatedAt = spawnKeyDefeatedAtMap.get(spawnKey);
            if (
              defeatedAt &&
              !checkIsEnemyRespawned(
                campEnemyTypes,
                defeatedAt,
                now,
                areaId,
                toValue(lastTeleportAts),
                toValue(trounceBlossoms).get(spawnKey),
              )
            )
              continue;
          } else if (Temporal.Instant.compare(Temporal.Instant.from(savedRespawnAt), now) > 0) continue;
          spawnKeyDefeatedAtMap.delete(spawnKey);
          if (campEnemyTypes.includes(EnemyType.Boss)) onRespawn(spawnKey);
          enemyMap.set(
            spawnKey,
            createEnemy(toValue(enemyTables), toValue(worldLevelRows), member, id, currentWorldLevel),
          );
        }
      }
      for (const { id, members } of fightingCamps) {
        if (loadedCampIds.has(id)) continue;
        loadedCampIds.add(id);
        for (const member of members) {
          const spawnKey = getSpawnKey(id, member.id);
          spawnKeyDefeatedAtMap.delete(spawnKey);
          enemyMap.set(
            spawnKey,
            createEnemy(toValue(enemyTables), toValue(worldLevelRows), member, id, currentWorldLevel),
          );
        }
      }
    },
  );
  return { getCampEnemyTypes, getEnemyCamps, spawnKeyDefeatedAtMap };
};
