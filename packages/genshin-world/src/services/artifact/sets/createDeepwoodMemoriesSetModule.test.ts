import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";

import { AttackTag } from "#src/models/combat/AttackTag";

import { KitEventKind } from "#src/models/kit/KitEventKind";

import { DEEPWOOD_MEMORIES_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createDeepwoodMemoriesSetModule } from "#src/services/artifact/sets/createDeepwoodMemoriesSetModule";
import { createSetWearer } from "#src/services/artifact/sets/createSetWearer.test";
import { getArtifactSetBonus } from "#src/services/artifact/sets/getArtifactSetBonus.test";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wearer = createSetWearer(KIT);
const damageDealtBy = (enemy: ReturnType<typeof createEnemy>, attackTag: AttackTag) =>
  ({
    attackTag,
    enemy,
    hit: KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken,
    striker: wearer,
  }) as const;

describe(createDeepwoodMemoriesSetModule, () => {
  test("lowers the Dendro RES of an enemy its wearer's Elemental Skill or Burst hits by 30% for 8 seconds, from four pieces", () => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const context = createKitTestContext(wearer, { party: createParty([TRAVELER_CHARACTER_ID]) });
    const { onKitEvent } = createDeepwoodMemoriesSetModule(
      getArtifactSetBonus(statTables, DEEPWOOD_MEMORIES_ARTIFACT_SET_ID, 4),
    );

    onKitEvent?.(damageDealtBy(enemy, AttackTag.NormalAttack), context, wearer);
    expect(enemy.statuses).toHaveLength(0);

    onKitEvent?.(damageDealtBy(enemy, AttackTag.ElementalSkill), context, wearer);
    onKitEvent?.(damageDealtBy(enemy, AttackTag.ElementalBurst), context, wearer);
    expect(enemy.statuses).toStrictEqual([
      {
        damageTakenBonus: 0,
        id: "deepwoodMemories",
        resistanceReduction: { [Element.Dendro]: 0.3 },
        secondsRemaining: 8,
      },
    ]);
  });
});
