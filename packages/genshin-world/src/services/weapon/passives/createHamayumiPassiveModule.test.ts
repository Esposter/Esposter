import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createHamayumiPassiveModule } from "#src/services/weapon/passives/createHamayumiPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const wielder: Combatant = createWielderCombatant();
// Hamayumi with synthetic params: its normal and charged attack DMG bonuses, and the full Energy increase of each
const hamayumiPassiveModule = createHamayumiPassiveModule([0.1, 0.2, 0.5]);
const createStrike = (attackTag: AttackTag): KitStrike => ({
  attackTag,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant: wielder,
  hit: TRAVELER_KIT.plungeCollision,
});
const createPartyWithEnergy = (energy: number) => {
  const party = createParty([TRAVELER_CHARACTER_ID]);
  getPartyMember(party, TRAVELER_CHARACTER_ID).energy = energy;
  return party;
};

describe(createHamayumiPassiveModule, () => {
  test("a normal and a charged attack each raise the bonus of their own kind by the rank's amount", () => {
    expect.hasAssertions();

    expect(hamayumiPassiveModule.getPassiveBonuses?.(wielder, 1, [], [])).toStrictEqual([
      { amount: 0.1, attribute: Attribute.NormalAttackDamageBonus },
      { amount: 0.2, attribute: Attribute.ChargedAttackDamageBonus },
    ]);
  });

  test("a normal attack's hit gains half the normal attack bonus again at full Energy", () => {
    expect.hasAssertions();

    const party = createPartyWithEnergy(TRAVELER_KIT.burstEnergyCost);

    expect(hamayumiPassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.NormalAttack), enemy, party, [])).toBe(
      0.05,
    );
  });

  test("a charged attack's hit gains half the charged attack bonus again at full Energy", () => {
    expect.hasAssertions();

    const party = createPartyWithEnergy(TRAVELER_KIT.burstEnergyCost);

    expect(hamayumiPassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.ChargedAttack), enemy, party, [])).toBe(
      0.1,
    );
  });

  test("a hit short of full Energy gains nothing", () => {
    expect.hasAssertions();

    const party = createPartyWithEnergy(TRAVELER_KIT.burstEnergyCost - 1);

    expect(hamayumiPassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.NormalAttack), enemy, party, [])).toBe(
      0,
    );
  });

  test("an elemental skill's hit gains nothing even at full Energy", () => {
    expect.hasAssertions();

    const party = createPartyWithEnergy(TRAVELER_KIT.burstEnergyCost);

    expect(hamayumiPassiveModule.getStrikeDamageBonus?.(createStrike(AttackTag.ElementalSkill), enemy, party, [])).toBe(
      0,
    );
  });
});
