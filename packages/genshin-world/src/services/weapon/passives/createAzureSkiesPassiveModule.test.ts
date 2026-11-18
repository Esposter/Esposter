import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createAzureSkiesPassiveModule } from "#src/services/weapon/passives/createAzureSkiesPassiveModule";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { getBuff } from "#src/services/weapon/passives/getBuff.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createAzureSkiesPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();
  // Azure Skies at its first rank: a 0.3 second cooldown, then 8% Normal Attack DMG and 6% Charged Attack DMG per stack
  const passiveModule = createAzureSkiesPassiveModule([6, 0.3, 0.08, 0.06]);

  test("a normal attack hit adds a stack, raising the Normal Attack DMG and Charged Attack DMG by the rank's amounts", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);

    expect(getBuff(context.kitEffectState, Attribute.NormalAttackDamageBonus)?.amount).toBeCloseTo(0.08);
    expect(getBuff(context.kitEffectState, Attribute.ChargedAttackDamageBonus)?.amount).toBeCloseTo(0.06);
  });

  test("a hit inside the rank's cooldown adds no stack, and one after it adds a second", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ChargedAttack, enemy), context, wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ChargedAttack, enemy), context, wielder);

    expect(getBuff(context.kitEffectState, Attribute.NormalAttackDamageBonus)?.amount).toBeCloseTo(0.08);

    stepKitSeconds(context, 0.35);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ChargedAttack, enemy), context, wielder);

    expect(getBuff(context.kitEffectState, Attribute.NormalAttackDamageBonus)?.amount).toBeCloseTo(0.16);
  });

  test("a fourth stack is held at the three the passive allows", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let hit = 0; hit < 4; hit++) {
      passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);
      stepKitSeconds(context, 0.35);
    }

    expect(getBuff(context.kitEffectState, Attribute.NormalAttackDamageBonus)?.amount).toBeCloseTo(0.24);
  });
});
