import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createKitTestContext, readBuffTuples, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createParty } from "#src/services/party/createParty";
import { createNorthwindWolfPassiveModule } from "#src/services/weapon/passives/createNorthwindWolfPassiveModule";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { getBuff } from "#src/services/weapon/passives/getBuff.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createNorthwindWolfPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();
  const party = createParty([TRAVELER_CHARACTER_ID]);
  // Northwind Wolf at its first rank: 16% DMG for Elemental Skill and Burst, and 2% CRIT Rate a stack for each of them, up
  // To four stacks for ten seconds, a stack at most once every 0.1 seconds
  const passiveModule = createNorthwindWolfPassiveModule([0.16, 10, 4, 0.02, 10, 4, 0.02, 0.1]);
  const hitWith = (context: KitContext, attackTag: AttackTag) =>
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, attackTag, enemy), context, wielder);

  test("an Elemental Skill or Burst strike is raised by the rank's DMG, and a normal attack's is not", () => {
    expect.hasAssertions();

    expect(
      passiveModule.getStrikeDamageBonus?.(createKitStrike(wielder, AttackTag.ElementalSkill), enemy, party, []),
    ).toBe(0.16);
    expect(
      passiveModule.getStrikeDamageBonus?.(createKitStrike(wielder, AttackTag.ElementalBurst), enemy, party, []),
    ).toBe(0.16);
    expect(
      passiveModule.getStrikeDamageBonus?.(createKitStrike(wielder, AttackTag.NormalAttack), enemy, party, []),
    ).toBe(0);
  });

  test("an Elemental Skill hit adds a CRIT Rate stack once a cooldown has passed, and the stacks are at most four", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    for (let hit = 0; hit < 5; hit++) {
      hitWith(context, AttackTag.ElementalSkill);
      hitWith(context, AttackTag.ElementalSkill);
      stepKitSeconds(context, 0.2);
    }

    expect(getBuff(context.kitEffectState, Attribute.CriticalRate)?.amount).toBeCloseTo(0.08);
  });

  test("a burst hit stacks on its own clock, beside the Elemental Skill's stacks", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    hitWith(context, AttackTag.ElementalSkill);
    hitWith(context, AttackTag.ElementalBurst);

    expect(readBuffTuples(context.kitEffectState.effects)).toStrictEqual([
      [Attribute.CriticalRate, 0.02, 10],
      [Attribute.CriticalRate, 0.02, 10],
    ]);
  });
});
