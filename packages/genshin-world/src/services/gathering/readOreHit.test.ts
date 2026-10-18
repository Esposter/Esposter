import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readOreHit } from "#src/services/gathering/readOreHit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(readOreHit, () => {
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 90,
    weaponType: WeaponType.Claymore,
  };
  const hit: KitHit = {
    actionAttackTag: AttackTag.NormalAttack,
    hitArea: { angle: 2 * Math.PI, height: 2, radius: 1 },
    hitmarkSeconds: 0,
    poiseDamage: 1,
    talentMultiplier: 1,
  };

  test("an ore hit takes the hit's area and poise, blunt and melee by the kit's rules", () => {
    expect.hasAssertions();

    expect(readOreHit(combatant, hit)).toStrictEqual({
      hitArea: hit.hitArea,
      isBlunt: true,
      isMelee: true,
      poiseDamage: hit.poiseDamage,
    });
  });
});
