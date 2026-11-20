import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, readBuffTuples, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createDeployedCombatant } from "#src/services/party/createDeployedCombatant.test";
import { createGoldenBloodTidePassiveModule } from "#src/services/weapon/passives/createGoldenBloodTidePassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

// A change of a tenth of a member's Max HP on the member, as a heal or a drain of its own
const createHealthChange = (characterId: number): KitHealthChangedEvent => ({
  bondOfLifeShare: 0,
  characterId,
  healthShare: 0.1,
  healthShareAfter: 1,
  healthShareBefore: 0.9,
  isFallRefused: false,
  kind: KitEventKind.HealthChanged,
  overflowHealthShare: 0,
});

describe(createGoldenBloodTidePassiveModule, () => {
  const wielder = createWielderCombatant();
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  // Golden Blood-Tide (Cashflow Supervision) at its first rank: 16% ATK static, and for each stack of the wielder's HP change
  // 16% Normal Attack DMG, 14% Charged Attack DMG and 14% Stellar-Conduct DMG for four seconds, up to three stacks, each stack
  // Once every 0.3 seconds, and with three stacks 8% ATK SPD
  const passiveModule = createGoldenBloodTidePassiveModule([4, 0.3, 0.16, 0.14, 0.08, 0.14]);

  test("the rank's ATK is static on the wielder", () => {
    expect.hasAssertions();

    expect(
      passiveModule.getPassiveBonuses?.(wielder, 1, [createDeployedCombatant(wielder, { isOnField: true })], []),
    ).toStrictEqual([{ amount: 0.16, attribute: Attribute.AttackPercent }]);
  });

  test("an HP change gives a stack of Normal Attack and Charged Attack DMG for four seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createHealthChange(TRAVELER_CHARACTER_ID), context, wielder);

    expect(readBuffTuples(context.kitEffectState.effects)).toStrictEqual([
      [Attribute.NormalAttackDamageBonus, 0.16, 4],
      [Attribute.ChargedAttackDamageBonus, 0.14, 4],
    ]);
  });

  test("a Stellar-Conduct the wielder triggers is raised by the stacks it holds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createHealthChange(TRAVELER_CHARACTER_ID), context, wielder);

    expect(
      passiveModule.getPartyReactionBonus?.(
        wielder,
        { combatant: wielder, enemy, reactionType: StellarReactionType.StellarConduct },
        context,
      ),
    ).toStrictEqual({ damageBonus: 0.14 });
  });

  test("three stacks give the wielder the rank's ATK SPD for as long as they last", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let change = 0; change < 3; change++) {
      passiveModule.onKitEvent?.(createHealthChange(TRAVELER_CHARACTER_ID), context, wielder);
      if (change < 2) stepKitSeconds(context, 0.5);
    }

    expect(readBuffTuples(context.kitEffectState.effects)).toStrictEqual([
      [Attribute.NormalAttackDamageBonus, 0.16 * 3, 4],
      [Attribute.ChargedAttackDamageBonus, 0.14 * 3, 4],
      [Attribute.NormalAttackSpeed, 0.08, 4],
    ]);
  });
});
