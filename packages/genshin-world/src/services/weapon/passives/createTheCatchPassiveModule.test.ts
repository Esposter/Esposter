import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createParty } from "#src/services/party/createParty";
import { createTheCatchPassiveModule } from "#src/services/weapon/passives/createTheCatchPassiveModule";
import { createWeaponStrike } from "#src/services/weapon/passives/createWeaponStrike.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createTheCatchPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TRAVELER_CHARACTER_ID]);
  const wielder = createWielderCombatant();
  // The Catch at its first rank: 16% Elemental Burst DMG and 6% Elemental Burst CRIT Rate, each a static line
  const passiveModule = createTheCatchPassiveModule([0.16, 0.06]);

  test("an Elemental Burst strike is priced with the rank's DMG Bonus and CRIT Rate", () => {
    expect.hasAssertions();

    const strike = createWeaponStrike(wielder, AttackTag.ElementalBurst);

    expect(passiveModule.getStrikeDamageBonus?.(strike, enemy, party, [])).toBe(0.16);
    expect(passiveModule.getStrikeCriticalRateBonus?.(strike, enemy, party, [])).toBe(0.06);
  });

  test("a normal attack strike is priced with neither", () => {
    expect.hasAssertions();

    const strike = createWeaponStrike(wielder, AttackTag.NormalAttack);

    expect(passiveModule.getStrikeDamageBonus?.(strike, enemy, party, [])).toBe(0);
    expect(passiveModule.getStrikeCriticalRateBonus?.(strike, enemy, party, [])).toBe(0);
  });
});
