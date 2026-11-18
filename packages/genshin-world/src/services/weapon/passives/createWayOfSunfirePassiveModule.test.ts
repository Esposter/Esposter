import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createParty } from "#src/services/party/createParty";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createWayOfSunfirePassiveModule } from "#src/services/weapon/passives/createWayOfSunfirePassiveModule";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWeaponStrike } from "#src/services/weapon/passives/createWeaponStrike.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createWayOfSunfirePassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();
  const party = createParty([TRAVELER_CHARACTER_ID]);
  // The Way of Sunfire at its first rank: a Charged Attack hit queues a Sunfire Arrow at 60% ATK on the enemy it struck, once
  // Every 10 seconds, which gives that enemy Heartsearer for 10 seconds, and Charged Attacks deal 28% more DMG to it while it lasts
  const passiveModule = createWayOfSunfirePassiveModule([10, 0.6, 10, 0.28]);

  test("a Charged Attack hit queues a Sunfire Arrow at the rank's multiplier and applies Heartsearer to the enemy struck", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ChargedAttack, enemy), context, wielder);

    expect(context.strikes).toHaveLength(1);
    expect(context.strikes[0]?.hit.talentMultiplier).toBe(0.6);
    expect(enemy.statuses).toHaveLength(1);
    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.ChargedAttack),
        enemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBe(0.28);
    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.NormalAttack),
        enemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBe(0);
  });

  test("a Charged Attack hit inside the rank's cooldown queues no second arrow", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ChargedAttack, enemy), context, wielder);
    stepKitSeconds(context, 5);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ChargedAttack, enemy), context, wielder);

    expect(context.strikes).toHaveLength(0);
  });
});
