import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createCloudfallAxiomPassiveModule } from "#src/services/weapon/passives/createCloudfallAxiomPassiveModule";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const readPlungingDamageBonus = (context: KitContext, wielder: Combatant): number =>
  getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap).attributes
    .attributeTotalMap[Attribute.PlungingAttackDamageBonus];

describe(createCloudfallAxiomPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TRAVELER_CHARACTER_ID]);
  const wielder = createWielderCombatant();
  const other = { ...wielder, characterId: OTHER_CHARACTER_ID };
  // Cloudfall Axiom at its first rank: a Plunging Attack its wielder hits with raises the party's Plunging Attack DMG
  // By 28% For 20 seconds, and a nearby member's Plunging Attack hit restores 2.5 Energy to the wielder, every 0.7
  // Seconds
  const passiveModule = createCloudfallAxiomPassiveModule([2.5, 0.7, 0.28, 20]);

  test("a Plunging Attack the wielder hits with raises the party's Plunging Attack DMG for the rank's seconds", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.PlungingAttack, enemy), context, wielder);

    expect(readPlungingDamageBonus(context, wielder)).toBe(0.28);

    stepKitSeconds(context, 20.1);

    expect(readPlungingDamageBonus(context, wielder)).toBe(0);
  });

  test("a nearby member's Plunging Attack restores the rank's Energy to the wielder, at most once every the rank's cooldown", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(createWeaponDamageTaken(other, AttackTag.PlungingAttack, enemy), context, wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(other, AttackTag.PlungingAttack, enemy), context, wielder);

    expect(getPartyMember(context.party, wielder.characterId).energy).toBe(2.5);

    stepKitSeconds(context, 0.8);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(other, AttackTag.PlungingAttack, enemy), context, wielder);

    expect(getPartyMember(context.party, wielder.characterId).energy).toBe(5);
  });

  test("a Normal Attack the wielder hits with raises nothing", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });
});
