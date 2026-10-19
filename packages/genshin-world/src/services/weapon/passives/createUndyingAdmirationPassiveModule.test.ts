import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createParty } from "#src/services/party/createParty";
import { createUndyingAdmirationPassiveModule } from "#src/services/weapon/passives/createUndyingAdmirationPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createUndyingAdmirationPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TRAVELER_CHARACTER_ID]);
  const wielder: Combatant = createWielderCombatant();
  // Synthetic params, not the weapon's row: a quarter DMG and a tenth CRIT Rate for an Elemental Skill
  const undyingAdmirationPassiveModule = createUndyingAdmirationPassiveModule([0.25, 0.1]);

  test("an elemental skill's strike gains the rank's DMG Bonus, and a normal attack's gains none", () => {
    expect.hasAssertions();

    expect(
      undyingAdmirationPassiveModule.getStrikeDamageBonus?.(
        createKitStrike(wielder, AttackTag.ElementalSkill),
        enemy,
        party,
        [],
      ),
    ).toBe(0.25);
    expect(
      undyingAdmirationPassiveModule.getStrikeDamageBonus?.(
        createKitStrike(wielder, AttackTag.NormalAttack),
        enemy,
        party,
        [],
      ),
    ).toBe(0);
  });

  test("an elemental skill's strike gains the rank's CRIT Rate, and a normal attack's gains none", () => {
    expect.hasAssertions();

    expect(
      undyingAdmirationPassiveModule.getStrikeCriticalRateBonus?.(
        createKitStrike(wielder, AttackTag.ElementalSkill),
        enemy,
        party,
        [],
      ),
    ).toBe(0.1);
    expect(
      undyingAdmirationPassiveModule.getStrikeCriticalRateBonus?.(
        createKitStrike(wielder, AttackTag.NormalAttack),
        enemy,
        party,
        [],
      ),
    ).toBe(0);
  });
});
