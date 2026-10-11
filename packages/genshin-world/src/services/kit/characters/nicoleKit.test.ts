import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { createNicoleKitBehaviour, NICOLE_CHARACTER_ID } from "#src/services/kit/characters/nicoleKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const NICOLE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, NICOLE_CHARACTER_ID);

describe(createNicoleKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    expect([
      takeOne(NICOLE_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(NICOLE_KIT.elementalBurst.hits).talentMultiplier,
      NICOLE_KIT.plungeCollision.talentMultiplier,
      takeOne(NICOLE_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(NICOLE_KIT.highPlunge.hits).talentMultiplier,
    ]).toStrictEqual([1.384, 3.168, 0.568288, 1.136335, 1.419344]);
  });

  test("her skill's hit lands at 9 frames as Pyro, cooling for 16 seconds", () => {
    expect.hasAssertions();
    const [skillHit] = NICOLE_KIT.elementalSkill.hits;
    expect(skillHit?.element).toBe(Element.Pyro);
    expect(Math.round(takeOne(NICOLE_KIT.elementalSkill.hits).hitmarkSeconds * 60)).toBe(9);
    expect(NICOLE_KIT.skillCooldownSeconds).toBe(16);
  });

  test("her burst's hit lands at 108 frames as Pyro, costing 60 energy and cooling for 15 seconds", () => {
    expect.hasAssertions();
    const burstHit = takeOne(NICOLE_KIT.elementalBurst.hits);
    expect(burstHit.element).toBe(Element.Pyro);
    expect(Math.round(burstHit.hitmarkSeconds * 60)).toBe(108);
    expect(NICOLE_KIT.burstEnergyCost).toBe(60);
    expect(NICOLE_KIT.burstCooldownSeconds).toBe(15);
  });
});
