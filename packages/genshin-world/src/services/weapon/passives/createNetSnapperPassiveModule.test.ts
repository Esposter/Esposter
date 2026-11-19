import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { createNetSnapperPassiveModule } from "#src/services/weapon/passives/createNetSnapperPassiveModule";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createNetSnapperPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();
  // Net Snapper at its first rank: after an Elemental Skill, Flowrider for 15 seconds, dealing 80% ATK as AoE DMG on an attack
  // Hit, up to three times and at most once every 2 seconds, and Flowrider can be triggered once every 12 seconds
  const passiveModule = createNetSnapperPassiveModule([0.8, 15, 3, 2, 12]);

  test("an attack hit queues the rank's AoE at most once every 2 seconds, and only three times after the wielder's Elemental Skill", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const hit = () =>
      passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);
    passiveModule.onKitEvent?.({ characterId: wielder.characterId, kind: KitEventKind.SkillUsed }, context, wielder);

    hit();
    hit();

    expect(context.strikes).toStrictEqual([
      {
        body: context.body,
        combatant: wielder,
        hit: { hitArea: SMALL_AOE_AREA, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: 0.8 },
        target: enemy,
      },
    ]);

    stepKitSeconds(context, 2);
    hit();

    expect(context.strikes).toHaveLength(1);

    stepKitSeconds(context, 2);
    hit();

    expect(context.strikes).toHaveLength(1);

    stepKitSeconds(context, 2);
    hit();

    expect(context.strikes).toHaveLength(0);
  });

  test("an attack hit with no Flowrider standing queues nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);

    expect(context.strikes).toHaveLength(0);
  });
});
