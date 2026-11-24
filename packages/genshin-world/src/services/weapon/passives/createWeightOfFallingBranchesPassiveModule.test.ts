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
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWeaponStrike } from "#src/services/weapon/passives/createWeaponStrike.test";
import { createWeightOfFallingBranchesPassiveModule } from "#src/services/weapon/passives/createWeightOfFallingBranchesPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const readAttributeTotal = (context: KitContext, wielder: Combatant, attribute: Attribute): number =>
  getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap).attributes
    .attributeTotalMap[attribute];

describe(createWeightOfFallingBranchesPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TRAVELER_CHARACTER_ID]);
  const wielder = createWielderCombatant();
  // The Weight of Falling Branches at its first rank: 16% Plunging Attack CRIT Rate, and 16% Normal, Charged and
  // Plunging Attack DMG for 10 seconds after a Plunging Attack hits
  const passiveModule = createWeightOfFallingBranchesPassiveModule([0.16, 0.16, 10]);

  test("the rank's CRIT Rate is added to the wielder's Plunging Attack strikes only", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);

    expect(
      passiveModule.getStrikeCriticalRateBonus?.(
        createWeaponStrike(wielder, AttackTag.PlungingAttack),
        enemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBe(0.16);
    expect(
      passiveModule.getStrikeCriticalRateBonus?.(
        createWeaponStrike(wielder, AttackTag.NormalAttack),
        enemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBe(0);
  });

  test("a Plunging Attack hit raises the wielder's Normal, Charged and Plunging Attack DMG for the rank's seconds", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.PlungingAttack, enemy), context, wielder);

    expect(readAttributeTotal(context, wielder, Attribute.NormalAttackDamageBonus)).toBe(0.16);
    expect(readAttributeTotal(context, wielder, Attribute.ChargedAttackDamageBonus)).toBe(0.16);
    expect(readAttributeTotal(context, wielder, Attribute.PlungingAttackDamageBonus)).toBe(0.16);

    stepKitSeconds(context, 10.1);

    expect(
      [Attribute.NormalAttackDamageBonus, Attribute.ChargedAttackDamageBonus, Attribute.PlungingAttackDamageBonus].map(
        (attribute) => readAttributeTotal(context, wielder, attribute),
      ),
    ).toStrictEqual([0, 0, 0]);
  });

  test("a Normal Attack hit raises nothing", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });
});
