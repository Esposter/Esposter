import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { createVarkaKitBehaviour, VARKA_CHARACTER_ID } from "#src/services/kit/characters/varkaKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const VARKA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, VARKA_CHARACTER_ID);

describe(createVarkaKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    expect([
      ...VARKA_KIT.elementalSkill.hits.map(({ talentMultiplier }) => talentMultiplier),
      ...VARKA_KIT.elementalBurst.hits.map(({ talentMultiplier }) => talentMultiplier),
      VARKA_KIT.plungeCollision.talentMultiplier,
      takeOne(VARKA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(VARKA_KIT.highPlunge.hits).talentMultiplier,
    ]).toStrictEqual([2.784, 3.3696, 1.8144, 0.745878, 1.49144, 1.862889]);
  });

  test("the skill's hit lands at 40 frames of a 55-frame animation, cooling for 16 seconds", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(VARKA_KIT.elementalSkill.hits).hitmarkSeconds * 60)).toBe(40);
    expect(Math.round(VARKA_KIT.elementalSkill.seconds * 60)).toBe(55);
    expect(VARKA_KIT.skillCooldownSeconds).toBe(16);
  });

  test("her burst's two hits land at 112 and 131 frames as Anemo, costing 60 energy and cooling for 15 seconds", () => {
    expect.hasAssertions();
    expect(
      VARKA_KIT.elementalBurst.hits.map(({ element, hitmarkSeconds }) => [element, Math.round(hitmarkSeconds * 60)]),
    ).toStrictEqual([
      [Element.Anemo, 112],
      [Element.Anemo, 131],
    ]);
    expect(VARKA_KIT.burstEnergyCost).toBe(60);
    expect(VARKA_KIT.burstCooldownSeconds).toBe(15);
  });

  test("her charged attack costs 50 stamina", () => {
    expect.hasAssertions();
    expect(VARKA_KIT.chargedAttackStamina).toBe(50);
  });
});
