import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { EnemyFamily } from "#src/models/enemy/EnemyFamily";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { createDecimatePassiveModule } from "#src/services/weapon/passives/createDecimatePassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createDecimatePassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // Decimate with a synthetic percentage, which is its only param
  const decimatePassiveModule = createDecimatePassiveModule([0.2]);
  const strike: KitStrike = {
    attackTag: AttackTag.NormalAttack,
    body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
    combatant: wielder,
    hit: TRAVELER_KIT.plungeCollision,
  };

  test("a strike on an automaton is raised by the rank's percentage", () => {
    expect.hasAssertions();

    expect(
      decimatePassiveModule.getStrikeDamageBonus?.(
        strike,
        { ...enemy, enemyFamily: EnemyFamily.Automatons },
        createParty([TRAVELER_CHARACTER_ID]),
        [],
      ),
    ).toBeCloseTo(0.2);
  });

  test("a strike on another family of enemy is not raised", () => {
    expect.hasAssertions();

    expect(
      decimatePassiveModule.getStrikeDamageBonus?.(
        strike,
        { ...enemy, enemyFamily: EnemyFamily.Hilichurls },
        createParty([TRAVELER_CHARACTER_ID]),
        [],
      ),
    ).toBe(0);
  });
});
