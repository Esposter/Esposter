import type { KitReaction } from "#src/models/kit/KitReaction";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWhiteFairysQueeningPassiveModule } from "#src/services/weapon/passives/createWhiteFairysQueeningPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createWhiteFairysQueeningPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();
  const createStellarReaction = (combatant: typeof wielder, reactionType: ReactionType): KitReaction => ({
    combatant,
    enemy,
    reactionType,
  });
  // White Fairy's Queening at its first rank: 16% Stellar-Conduct and Stellar Swirl DMG for 5 seconds per stack of
  // Transcendence, A stack each Charged Attack hit once every 0.2 seconds and up to three
  const passiveModule = createWhiteFairysQueeningPassiveModule([0.28, 0.16, 5]);

  test("a Charged Attack hit gives the wielder a stack, raising its Stellar Swirl DMG by the rank's amount", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ChargedAttack, enemy), context, wielder);

    expect(
      passiveModule.getPartyReactionBonus?.(wielder, createStellarReaction(wielder, ReactionType.StellarSwirl), context)
        ?.damageBonus,
    ).toBe(0.16);
  });

  test("stacks come once every 0.2 seconds and up to three, each for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const stellarConduct = createStellarReaction(wielder, ReactionType.StellarConduct);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ChargedAttack, enemy), context, wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ChargedAttack, enemy), context, wielder);

    expect(passiveModule.getPartyReactionBonus?.(wielder, stellarConduct, context).damageBonus).toBe(0.16);

    stepKitSeconds(context, 0.2);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ChargedAttack, enemy), context, wielder);
    stepKitSeconds(context, 0.2);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ChargedAttack, enemy), context, wielder);
    stepKitSeconds(context, 0.2);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ChargedAttack, enemy), context, wielder);

    expect(passiveModule.getPartyReactionBonus?.(wielder, stellarConduct, context).damageBonus).toBe(0.48);

    stepKitSeconds(context, 5.1);

    expect(passiveModule.getPartyReactionBonus?.(wielder, stellarConduct, context).damageBonus).toBeUndefined();
  });

  test("a Stellar reaction a nearby member makes, or a Normal Attack hit, raises nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);

    expect(
      passiveModule.getPartyReactionBonus?.(
        wielder,
        createStellarReaction({ ...wielder, characterId: OTHER_CHARACTER_ID }, ReactionType.StellarSwirl),
        context,
      ).damageBonus,
    ).toBeUndefined();
    expect(context.kitEffectState.effects).toStrictEqual([]);
  });
});
