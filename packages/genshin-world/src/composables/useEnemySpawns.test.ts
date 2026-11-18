import type { BossMove } from "#src/models/bosses/BossMove";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyCamp } from "#src/models/enemy/EnemyCamp";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { useEnemySpawns } from "#src/composables/useEnemySpawns";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { EnemyKindMovesLoaderMap } from "#src/services/bosses/EnemyKindMovesLoaderMap";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { flushReads } from "#src/services/shared/flushReads.test";
import { useWorldEnemyKindMovesStore } from "#src/store/enemyKindMoves";
import { startTestWorldSession } from "#src/store/session.fixture";
import { takeOne } from "@esposter/shared";
import { afterEach, describe, expect, test, vi } from "vitest";

const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(useEnemySpawns, () => {
  // A boss kind the published kinds hold, so its camp can spawn
  const BOSS_KIND_ID = takeOne(
    Object.values(EnemyKindId).filter(
      (enemyKindId) => EnemyKindMovesLoaderMap[enemyKindId] !== undefined && enemyTables.enemyKindMap.has(enemyKindId),
    ),
  );
  const BOSS_MEMBER = { ...ENEMY_CAMP_MEMBER, enemyKindId: BOSS_KIND_ID };
  const CAMP_ID = "camp";
  const WORLD_LEVEL = 8;

  const createCamp = (members: EnemyCamp["members"]): EnemyCamp => ({ areaId: "mondstadt", id: CAMP_ID, members });

  // The camps spawn into an enemy map as an outcrop's fight does, through the same spawn as a region's camps
  const spawnCamps = (camps: EnemyCamp[]) => {
    const enemyMap = new Map<string, Enemy>();
    useEnemySpawns({
      bossDefeatMap: new Map(),
      enemyMap,
      enemyRespawnMap: new Map(),
      enemyTables,
      getWorldNow: () => Temporal.Instant.fromEpochMilliseconds(0),
      lastTeleportAts: new Map(),
      onLoad: () => {},
      onRespawn: () => {},
      outcropCamps: camps,
      regionDataMap: new Map(),
      trounceBlossoms: new Map(),
      worldLevel: WORLD_LEVEL,
      worldLevelRows: adventureRankTables.worldLevelRows,
    });
    return enemyMap;
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("the first screen loads no boss's moves: a camp of common enemies spawns with none requested", () => {
    expect.hasAssertions();

    startTestWorldSession();
    const loadBossMoves = vi.spyOn(EnemyKindMovesLoaderMap, BOSS_KIND_ID);
    const enemyMap = spawnCamps([createCamp([ENEMY_CAMP_MEMBER])]);

    expect(enemyMap.size).toBe(1);
    expect(loadBossMoves).not.toHaveBeenCalled();
  });

  test("a camp with a boss waits for the boss's moves, which load once, and spawns with them", async () => {
    expect.hasAssertions();

    startTestWorldSession();
    const worldEnemyKindMovesStore = useWorldEnemyKindMovesStore();
    // The moves stay on their way until the test lets them arrive, so the camp is seen waiting
    const bossMoves: readonly BossMove[] = [];
    const bossMovesLoad = Promise.withResolvers<readonly BossMove[]>();
    const loadBossMoves = vi.spyOn(EnemyKindMovesLoaderMap, BOSS_KIND_ID).mockReturnValue(bossMovesLoad.promise);
    const enemyMap = spawnCamps([createCamp([BOSS_MEMBER])]);

    expect(loadBossMoves).toHaveBeenCalledExactlyOnceWith();
    expect(enemyMap.size).toBe(0);
    bossMovesLoad.resolve(bossMoves);
    await flushReads();
    expect(enemyMap.size).toBe(1);
    expect(worldEnemyKindMovesStore.enemyKindMovesMap[BOSS_KIND_ID]).toBe(bossMoves);
  });
});
