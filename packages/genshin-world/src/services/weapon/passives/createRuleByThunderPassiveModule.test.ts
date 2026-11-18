import type { KitContext } from "#src/models/kit/KitContext";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createRuleByThunderPassiveModule } from "#src/services/weapon/passives/createRuleByThunderPassiveModule";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createRuleByThunderPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();
  // Rule by Thunder at its first rank: the Thunder Emblem's 12%, 24% and 40% Normal Attack DMG for one to three stacks, a
  // Stack from a normal attack for five seconds, from an Elemental Skill for ten, and one held while the Energy is short of full
  const passiveModule = createRuleByThunderPassiveModule([0.2, 0.12, 0.24, 0.4, 5, 10]);
  const createFullEnergyContext = (): KitContext => {
    const party = createParty([TRAVELER_CHARACTER_ID]);
    getPartyMember(party, TRAVELER_CHARACTER_ID).energy = wielder.kit.burstEnergyCost;
    return createKitTestContext(wielder, { party });
  };
  const readBonuses = (context: KitContext) =>
    passiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects) ?? [];
  const skillUsed = (context: KitContext) =>
    passiveModule.onKitEvent?.({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context, wielder);

  test("a normal attack's hit adds a stack, raising Normal Attack DMG by the rank's share for its level", () => {
    expect.hasAssertions();

    const context = createFullEnergyContext();
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);

    expect(readBonuses(context)).toStrictEqual([{ amount: 0.12, attribute: Attribute.NormalAttackDamageBonus }]);

    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);

    expect(readBonuses(context)).toStrictEqual([{ amount: 0.4, attribute: Attribute.NormalAttackDamageBonus }]);
  });

  test("an Elemental Skill's stack lasts ten seconds, outliving a normal attack's five", () => {
    expect.hasAssertions();

    const context = createFullEnergyContext();
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);
    skillUsed(context);
    stepKitSeconds(context, 6);

    expect(readBonuses(context)).toStrictEqual([{ amount: 0.12, attribute: Attribute.NormalAttackDamageBonus }]);

    stepKitSeconds(context, 5);

    expect(readBonuses(context)).toStrictEqual([]);
  });

  test("energy short of full holds a stack, which goes when the energy is full", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const context = createKitTestContext(wielder, { party });
    passiveModule.onStep?.(context, wielder, FIXED_STEP_SECONDS);

    expect(readBonuses(context)).toStrictEqual([{ amount: 0.12, attribute: Attribute.NormalAttackDamageBonus }]);

    getPartyMember(party, TRAVELER_CHARACTER_ID).energy = wielder.kit.burstEnergyCost;
    passiveModule.onStep?.(context, wielder, FIXED_STEP_SECONDS);

    expect(readBonuses(context)).toStrictEqual([]);
  });
});
