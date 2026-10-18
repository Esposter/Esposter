import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createKachinaKitBehaviour, KACHINA_CHARACTER_ID } from "#src/services/kit/characters/kachinaKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const KACHINA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, KACHINA_CHARACTER_ID);
const DEFENSE = 1000;

// Turbo Twirly's hits' flat damage from Kachina's DEF, with her at the given ascension
const readSkillBonuses = (ascension: number): number[] => {
  const combatant: Combatant = {
    ascension,
    attributes: computeCharacterAttributes([{ attribute: Attribute.Defense, value: DEFENSE }]),
    characterId: KACHINA_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: KACHINA_KIT,
    level: 90,
    weaponType: WeaponType.Claymore,
  };
  return KACHINA_KIT.elementalSkill.hits.map((hit) => hit.additiveBaseDamageBonus?.(combatant) ?? 0);
};

describe(createKachinaKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    expect([
      takeOne(takeOne(KACHINA_KIT.normalAttacks).hits).talentMultiplier,
      takeOne(KACHINA_KIT.chargedAttack.hits).talentMultiplier,
      KACHINA_KIT.plungeCollision.talentMultiplier,
      takeOne(KACHINA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(KACHINA_KIT.highPlunge.hits).talentMultiplier,
    ]).toStrictEqual([0.493984, 1.1266, 0.639324, 1.278377, 1.596762]);
  });

  test("her burst's hit is a share of her DEF, with no talent multiplier of its own", () => {
    expect.hasAssertions();
    const burstHit = takeOne(KACHINA_KIT.elementalBurst.hits);
    expect(burstHit.talentMultiplier).toBe(0);
    expect(burstHit.additiveBaseDamageBonus).toBeTypeOf("function");
  });

  test("her burst hits at 18 frames of a 50-frame animation, costing 70 energy and cooling for 18 seconds", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(KACHINA_KIT.elementalBurst.hits).hitmarkSeconds * 60)).toBe(18);
    expect(Math.round(KACHINA_KIT.elementalBurst.seconds * 60)).toBe(50);
    expect(KACHINA_KIT.burstEnergyCost).toBe(70);
    expect(KACHINA_KIT.burstCooldownSeconds).toBe(18);
  });

  test("her charged attack costs 25 stamina and her skill cools for 20 seconds", () => {
    expect.hasAssertions();
    expect(KACHINA_KIT.chargedAttackStamina).toBe(25);
    expect(KACHINA_KIT.skillCooldownSeconds).toBe(20);
  });
});

describe("the weight of Stone", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(readSkillBonuses(4)).toStrictEqual(KACHINA_KIT.elementalSkill.hits.map(() => 0.2 * DEFENSE));
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(readSkillBonuses(3)).toStrictEqual(KACHINA_KIT.elementalSkill.hits.map(() => 0));
  });
});
