import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { createParty } from "#src/services/party/createParty";
import { createHalcyonYearsUnendingPassiveModule } from "#src/services/weapon/passives/createHalcyonYearsUnendingPassiveModule";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const createWielder = (defense: number) =>
  createWielderCombatant([{ attribute: Attribute.BaseDefense, value: defense }]);

const readAttributeTotal = (context: KitContext, wielder: Combatant, attribute: Attribute): number =>
  getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap).attributes
    .attributeTotalMap[attribute];

describe(createHalcyonYearsUnendingPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TRAVELER_CHARACTER_ID]);
  // Halcyon Years Unending at its first rank: each Normal or Plunging Attack hit gives Ode to Flowers, 8% DEF and 10%
  // All Elemental DMG Bonus for 6 seconds, up to two stacks, and two stacks raise the party's All Elemental DMG Bonus
  // By 8% per 1,000 DEF the wielder has, up to 25.6%, for 15 seconds
  const passiveModule = createHalcyonYearsUnendingPassiveModule([0.08, 6, 0.1, 0.1, 0, 0.08, 15, 3200]);

  test("a Normal Attack hit gives one stack of the rank's DEF and All Elemental DMG Bonus", () => {
    expect.hasAssertions();

    const wielder = createWielder(1600);
    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);

    expect(readAttributeTotal(context, wielder, Attribute.DefensePercent)).toBe(0.08);
    expect(readAttributeTotal(context, wielder, Attribute.AllDamageBonus)).toBe(0.1);
  });

  test("two stacks raise the party's All Elemental DMG Bonus by the rank's amount per 1,000 DEF, up to its cap", () => {
    expect.hasAssertions();

    const wielder = createWielder(5000);
    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);
    stepKitSeconds(context, 0.1);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.PlungingAttack, enemy), context, wielder);

    expect(readAttributeTotal(context, wielder, Attribute.AllDamageBonus)).toBeCloseTo(0.2 + 0.256);

    stepKitSeconds(context, 6.1);

    expect(readAttributeTotal(context, wielder, Attribute.AllDamageBonus)).toBeCloseTo(0.256);
  });

  test("an Elemental Skill hit raises nothing", () => {
    expect.hasAssertions();

    const wielder = createWielder(1600);
    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ElementalSkill, enemy), context, wielder);

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });
});
