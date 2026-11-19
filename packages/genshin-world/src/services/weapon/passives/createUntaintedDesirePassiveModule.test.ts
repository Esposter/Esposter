import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createUntaintedDesirePassiveModule } from "#src/services/weapon/passives/createUntaintedDesirePassiveModule";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { getBuff } from "#src/services/weapon/passives/getBuff.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createUntaintedDesirePassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();
  // Untainted Desire at its first rank: six seconds, 8% ATK and 6% Energy Recharge per stack, up to three stacks
  const passiveModule = createUntaintedDesirePassiveModule([6, 0.08, 0.06, 3]);

  test("an Elemental Skill hit adds a stack, raising ATK and Energy Recharge by the rank's amounts", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ElementalSkill, enemy), context, wielder);

    expect(getBuff(context.kitEffectState, Attribute.AttackPercent)?.amount).toBe(0.08);
    expect(getBuff(context.kitEffectState, Attribute.EnergyRecharge)?.amount).toBe(0.06);
  });

  test("a normal attack hit adds no stack", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);

    expect(getBuff(context.kitEffectState, Attribute.AttackPercent)).toBeUndefined();
  });

  test("a fourth Elemental Skill hit is held at the three stacks the passive allows", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let hit = 0; hit < 4; hit++)
      passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ElementalSkill, enemy), context, wielder);

    expect(getBuff(context.kitEffectState, Attribute.AttackPercent)?.amount).toBe(0.24);
    expect(getBuff(context.kitEffectState, Attribute.EnergyRecharge)?.amount).toBe(0.18);
  });

  test("a hit counts off the field, and another member's hit adds nothing", () => {
    expect.hasAssertions();

    const other = { ...wielder, characterId: OTHER_CHARACTER_ID };
    const context = createKitTestContext(wielder, { activeCombatant: other });
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ElementalSkill, enemy), context, wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(other, AttackTag.ElementalSkill, enemy), context, wielder);

    expect(getBuff(context.kitEffectState, Attribute.AttackPercent)?.amount).toBe(0.08);
  });
});
