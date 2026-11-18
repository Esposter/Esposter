import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createParty } from "#src/services/party/createParty";
import { createSecretSilversTestamentPassiveModule } from "#src/services/weapon/passives/createSecretSilversTestamentPassiveModule";
import { createWeaponStrike } from "#src/services/weapon/passives/createWeaponStrike.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createSecretSilversTestamentPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TRAVELER_CHARACTER_ID]);
  // Secret Silver's Testament at its first rank: 20% Elemental Burst DMG, raised by 16% for a burst costing no more than
  // 60 Energy and by 28% for one costing no more than 40
  const passiveModule = createSecretSilversTestamentPassiveModule([0.2, 0.16, 0.28]);

  test.each([
    [80, 0.2],
    [60, 0.36],
    [40, 0.48],
  ])("a burst costing %s Energy is priced at %s", (burstEnergyCost, damageBonus) => {
    expect.hasAssertions();

    const wielder = createWielderCombatant();
    const costedWielder = { ...wielder, kit: { ...wielder.kit, burstEnergyCost } };
    const strike = createWeaponStrike(costedWielder, AttackTag.ElementalBurst);

    expect(passiveModule.getStrikeDamageBonus?.(strike, enemy, party, [])).toBeCloseTo(damageBonus);
  });

  test("a normal attack strike is priced with none of it", () => {
    expect.hasAssertions();

    const strike = createWeaponStrike(createWielderCombatant(), AttackTag.NormalAttack);

    expect(passiveModule.getStrikeDamageBonus?.(strike, enemy, party, [])).toBe(0);
  });
});
