import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createParty } from "#src/services/party/createParty";
import { createKaidanRainfallEarthbinderPassiveModule } from "#src/services/weapon/passives/createKaidanRainfallEarthbinderPassiveModule";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWeaponStrike } from "#src/services/weapon/passives/createWeaponStrike.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createKaidanRainfallEarthbinderPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const otherEnemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();
  const party = createParty([TRAVELER_CHARACTER_ID]);
  // Kaidan: Rainfall Earthbinder at its first rank: an attack hit inflicts Cursed Parasol on the enemy it struck for 10
  // Seconds, Once every 15 seconds, and the wielder deals 16% more DMG to that enemy while it lasts
  const passiveModule = createKaidanRainfallEarthbinderPassiveModule([10, 0.16, 15]);

  test("an attack hit the wielder deals inflicts Cursed Parasol, which raises the wielder's DMG to that enemy", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);

    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.NormalAttack),
        enemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBe(0.16);
    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.NormalAttack),
        otherEnemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBe(0);
  });

  test("a second hit inside the rank's cooldown inflicts nothing on the next enemy", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);
    stepKitSeconds(context, 5);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, otherEnemy), context, wielder);

    expect(otherEnemy.statuses).toStrictEqual([]);
  });

  test("the enemy with Cursed Parasol defeated refreshes the cooldown, so the next hit inflicts at once", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);
    passiveModule.onKitEvent?.({ enemy, kind: KitEventKind.EnemyDefeated, striker: wielder }, context, wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, otherEnemy), context, wielder);

    expect(otherEnemy.statuses).toHaveLength(1);
  });
});
