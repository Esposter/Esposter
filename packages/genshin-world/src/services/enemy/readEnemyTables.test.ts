import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { describe, expect, test } from "vitest";

describe(readEnemyTables, () => {
  // A kind whose article names a Drops template takes the template's materials as its drop source, one tier each.
  // The Wiki gives them no count, so none is read
  test.each([
    {
      enemyKindId: EnemyKindId.ErodingAvatarOfLava,
      materials: [
        { itemId: 112110, tier: 0 },
        { itemId: 112111, tier: 1 },
        { itemId: 112112, tier: 2 },
      ],
      name: "Eroding Avatar of Lava",
    },
    {
      enemyKindId: EnemyKindId.SecretSourceAutomatonHunterSeeker,
      materials: [
        { itemId: 112113, tier: 0 },
        { itemId: 112114, tier: 1 },
        { itemId: 112115, tier: 2 },
      ],
      name: "Secret Source Automaton: Hunter-Seeker",
    },
    {
      enemyKindId: EnemyKindId.BitingColdWayobManifestation,
      materials: [
        { itemId: 112107, tier: 0 },
        { itemId: 112108, tier: 1 },
        { itemId: 112109, tier: 2 },
      ],
      name: "Biting-Cold Wayob Manifestation",
    },
  ])("$name's drop source is its Drops template's materials by tier", async ({ enemyKindId, materials }) => {
    expect.hasAssertions();

    const { enemyDropTableMap, enemyKindMap } = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

    expect(enemyKindMap.get(enemyKindId)?.dropSource).toStrictEqual({ materials, type: "template" });
    expect(enemyDropTableMap.has(enemyKindId)).toBe(false);
  });

  test("a boss's drop source is its reward, and it reads no drop table", async () => {
    expect.hasAssertions();

    const { enemyDropTableMap, enemyKindMap } = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

    expect(enemyKindMap.get(EnemyKindId.AnemoHypostasis)?.dropSource).toStrictEqual({ type: "bossReward" });
    expect(enemyDropTableMap.has(EnemyKindId.AnemoHypostasis)).toBe(false);
  });
});
