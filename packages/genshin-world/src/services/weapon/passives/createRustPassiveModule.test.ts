import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createParty } from "#src/services/party/createParty";
import { createRustPassiveModule } from "#src/services/weapon/passives/createRustPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createRustPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // Synthetic params, not the weapon's row: half more normal attack DMG and a fifth less charged attack DMG
  const rustPassiveModule = createRustPassiveModule([0.5, 0.2]);

  test("a normal attack is raised by the rank's percentage and a charged attack is lowered by the second", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    expect(
      rustPassiveModule.getStrikeDamageBonus?.(createKitStrike(wielder, AttackTag.NormalAttack), enemy, party, []),
    ).toBeCloseTo(0.5);
    expect(
      rustPassiveModule.getStrikeDamageBonus?.(createKitStrike(wielder, AttackTag.ChargedAttack), enemy, party, []),
    ).toBeCloseTo(-0.2);
  });

  test("an elemental skill is not changed", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    expect(
      rustPassiveModule.getStrikeDamageBonus?.(createKitStrike(wielder, AttackTag.ElementalSkill), enemy, party, []),
    ).toBe(0);
  });
});
