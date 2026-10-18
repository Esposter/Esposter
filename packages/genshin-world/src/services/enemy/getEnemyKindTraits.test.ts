import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { EnemyDropFamily } from "#src/models/enemy/EnemyDropFamily";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { EnemyType } from "#src/models/enemy/EnemyType";
import { PoiseType } from "#src/models/enemy/PoiseType";
import { EnemyKindTraitsMap } from "#src/services/enemy/EnemyKindTraitsMap";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyKindTraits } from "#src/services/enemy/getEnemyKindTraits";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { describe, expect, test } from "vitest";

const { enemyKindMap } = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const UNPLACED_ENEMY_KIND_ID = 21010201;
// The Pyro Abyss Mage a Mondstadt bounty names, the monster the wiki's list resolves to
const PYRO_ABYSS_MAGE_ENEMY_KIND_ID = 22010101;
const hilichurlFighter = getEnemyKind(enemyKindMap, EnemyKindId.HilichurlFighter);

describe(getEnemyKindTraits, () => {
  test("a kind with hand-written traits keeps them", () => {
    expect.hasAssertions();

    expect(getEnemyKindTraits(enemyKindMap, EnemyKindId.HilichurlFighter)).toStrictEqual(
      EnemyKindTraitsMap[EnemyKindId.HilichurlFighter],
    );
  });

  test("a kind without hand-written traits takes the poise and drop family its family's kinds of its type share", () => {
    expect.hasAssertions();
    const unplacedKinds = new Map([
      ...enemyKindMap,
      [UNPLACED_ENEMY_KIND_ID, { ...hilichurlFighter, id: UNPLACED_ENEMY_KIND_ID }],
    ]);

    expect(getEnemyKindTraits(unplacedKinds, UNPLACED_ENEMY_KIND_ID)).toStrictEqual({
      energyDrops: [],
      enemyDropFamily: EnemyDropFamily.Hilichurls,
      poiseType: PoiseType.Minion,
    });
  });

  test("a kind whose family has no kind of its type takes the poise of its type", () => {
    expect.hasAssertions();
    const unplacedKinds = new Map([
      ...enemyKindMap,
      [UNPLACED_ENEMY_KIND_ID, { ...hilichurlFighter, enemyType: EnemyType.Boss, id: UNPLACED_ENEMY_KIND_ID }],
    ]);

    expect(getEnemyKindTraits(unplacedKinds, UNPLACED_ENEMY_KIND_ID)).toStrictEqual({
      energyDrops: [],
      poiseType: PoiseType.Boss,
    });
  });

  test("a kind written with its element takes that element", () => {
    expect.hasAssertions();

    expect(getEnemyKindTraits(enemyKindMap, PYRO_ABYSS_MAGE_ENEMY_KIND_ID)).toStrictEqual({
      element: Element.Pyro,
      energyDrops: [],
      poiseType: PoiseType.HumanoidGrunt,
    });
  });
});
