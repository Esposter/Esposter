import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readOreHit } from "#src/services/gathering/readOreHit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createTravelerKit } from "#src/services/kit/travelerKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

describe(readOreHit, () => {
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
  const hit: KitHit = {
    hitArea: { angle: 2 * Math.PI, height: 2, radius: 1 },
    hitmarkSeconds: 0,
    poiseDamage: 1,
    talentMultiplier: 1,
  };

  test.each<[AttackTag | undefined, WeaponType, boolean]>([
    [AttackTag.NormalAttack, WeaponType.Sword, true],
    [AttackTag.ChargedAttack, WeaponType.Claymore, true],
    [AttackTag.PlungingAttack, WeaponType.Sword, false],
    [AttackTag.NormalAttack, WeaponType.Bow, false],
    [undefined, WeaponType.Polearm, false],
  ])("reads a hit in a %s action of a %s wielder as melee: %s", (actionAttackTag, weaponType, isMelee) => {
    expect.hasAssertions();

    // The kind the hit is dealt as is not the one read: a normal attack's hit dealt as a skill's is still melee
    expect(
      readOreHit({ ...combatant, weaponType }, { ...hit, actionAttackTag, attackTag: AttackTag.ElementalSkill })
        .isMelee,
    ).toBe(isMelee);
  });
});
