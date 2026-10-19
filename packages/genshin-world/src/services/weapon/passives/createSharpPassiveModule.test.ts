import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createParty } from "#src/services/party/createParty";
import { createSharpPassiveModule } from "#src/services/weapon/passives/createSharpPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createSharpPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // A synthetic DMG percentage of half, not the weapon's row
  const sharpPassiveModule = createSharpPassiveModule([0.5]);

  test("a normal attack its wielder deals is raised by the rank's percentage", () => {
    expect.hasAssertions();

    expect(
      sharpPassiveModule.getStrikeDamageBonus?.(
        createKitStrike(wielder, AttackTag.NormalAttack),
        enemy,
        createParty([TRAVELER_CHARACTER_ID]),
        [],
      ),
    ).toBeCloseTo(0.5);
  });

  test("a charged attack its wielder deals is not raised", () => {
    expect.hasAssertions();

    expect(
      sharpPassiveModule.getStrikeDamageBonus?.(
        createKitStrike(wielder, AttackTag.ChargedAttack),
        enemy,
        createParty([TRAVELER_CHARACTER_ID]),
        [],
      ),
    ).toBe(0);
  });
});
