import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createParty } from "#src/services/party/createParty";
import { createSkillAndBurstDamagePassiveModule } from "#src/services/weapon/passives/createSkillAndBurstDamagePassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createSkillAndBurstDamagePassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // A synthetic half more Elemental Skill and Elemental Burst DMG, not the weapon's row
  const skillAndBurstDamagePassiveModule = createSkillAndBurstDamagePassiveModule([0.5]);

  test("an elemental skill and an elemental burst are raised by the rank's percentage", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    expect(
      skillAndBurstDamagePassiveModule.getStrikeDamageBonus?.(
        createKitStrike(wielder, AttackTag.ElementalSkill),
        enemy,
        party,
        [],
      ),
    ).toBeCloseTo(0.5);
    expect(
      skillAndBurstDamagePassiveModule.getStrikeDamageBonus?.(
        createKitStrike(wielder, AttackTag.ElementalBurst),
        enemy,
        party,
        [],
      ),
    ).toBeCloseTo(0.5);
  });

  test("a normal attack is not raised", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    expect(
      skillAndBurstDamagePassiveModule.getStrikeDamageBonus?.(
        createKitStrike(wielder, AttackTag.NormalAttack),
        enemy,
        party,
        [],
      ),
    ).toBe(0);
  });
});
