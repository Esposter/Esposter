import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createBygoneAzureTeardropPassiveModule } from "#src/services/weapon/passives/createBygoneAzureTeardropPassiveModule";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createBygoneAzureTeardropPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();
  // Bygone Azure Teardrop at its first rank: Normal Attack SPD 10%. After an Elemental Skill, Normal Attack DMG rises by 4.8%
  // Each second for fourteen seconds, and by 9.6% for each normal attack hit, once every 0.3 seconds, up to 48% in all
  const passiveModule = createBygoneAzureTeardropPassiveModule([0.1, 0.048, 14, 1, 2, 0.3, 10]);
  const useSkill = (context: KitContext) =>
    passiveModule.onKitEvent?.({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context, wielder);
  const hitWithNormalAttack = (context: KitContext) =>
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);
  // The Normal Attack DMG a wielder's effects raise, zero while none is raised
  const readNormalAttackDamage = (context: KitContext) =>
    passiveModule
      .getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects)
      ?.find((bonus) => bonus.attribute === Attribute.NormalAttackDamageBonus)?.amount ?? 0;

  test("its Normal Attack SPD is a passive bonus, and after an Elemental Skill its Normal Attack DMG rises a second", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    expect(passiveModule.getPassiveBonuses?.(wielder, 1, [], [])).toStrictEqual([
      { amount: 0.1, attribute: Attribute.NormalAttackSpeed },
    ]);

    useSkill(context);
    stepKitSeconds(context, 3.5);

    expect(readNormalAttackDamage(context)).toBeCloseTo(0.144);
  });

  test("a normal attack hit adds two seconds' worth once every 0.3 seconds, and the total is at most 48%", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    useSkill(context);
    hitWithNormalAttack(context);
    hitWithNormalAttack(context);

    expect(readNormalAttackDamage(context)).toBeCloseTo(0.096);

    for (let hit = 0; hit < 8; hit++) {
      stepKitSeconds(context, 0.35);
      hitWithNormalAttack(context);
    }

    expect(readNormalAttackDamage(context)).toBeCloseTo(0.48);
  });

  test("an Elemental Skill again restarts the rise, and leaving the field ends it", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    useSkill(context);
    stepKitSeconds(context, 3.5);
    useSkill(context);

    expect(readNormalAttackDamage(context)).toBe(0);
  });
});
