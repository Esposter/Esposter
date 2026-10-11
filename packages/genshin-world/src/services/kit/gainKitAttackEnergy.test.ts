import type { AttackTag } from "#src/models/combat/AttackTag";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag as AttackTagValue } from "#src/models/combat/AttackTag";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitState } from "#src/services/kit/createKitState";
import { gainKitAttackEnergy } from "#src/services/kit/gainKitAttackEnergy";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createTravelerKit } from "#src/services/kit/travelerKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

describe(gainKitAttackEnergy, () => {
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 90,
    weaponType: WeaponType.Sword,
  };
  const createStrike = (attackTag: AttackTag | undefined): KitStrike => ({
    attackTag,
    body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
    combatant,
    hit: takeOne(takeOne(TRAVELER_KIT.normalAttacks).hits),
  });

  test.each<[AttackTag | undefined, number]>([
    [AttackTagValue.NormalAttack, 1],
    [AttackTagValue.ChargedAttack, 1],
    [AttackTagValue.PlungingAttack, 0],
    [AttackTagValue.ElementalSkill, 0],
    [undefined, 0],
  ])("gives a %s strike's character %d energy on a passing roll", (attackTag, energy) => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    gainKitAttackEnergy(createKitState(), [createStrike(attackTag)], party, () => 0);

    expect(getPartyMember(party, TRAVELER_CHARACTER_ID).energy).toBe(energy);
  });

  test("gives no more than the burst costs", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    getPartyMember(party, TRAVELER_CHARACTER_ID).energy = TRAVELER_KIT.burstEnergyCost;
    gainKitAttackEnergy(createKitState(), [createStrike(AttackTagValue.NormalAttack)], party, () => 0);

    expect(getPartyMember(party, TRAVELER_CHARACTER_ID).energy).toBe(TRAVELER_KIT.burstEnergyCost);
  });
});
