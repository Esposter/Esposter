import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { createPruneKitBehaviour, PRUNE_CHARACTER_ID } from "#src/services/kit/characters/pruneKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const PRUNE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, PRUNE_CHARACTER_ID);

describe(createPruneKitBehaviour, () => {
  test("her skill and burst read their talent multipliers from their proud skill groups", () => {
    expect.hasAssertions();
    expect([
      takeOne(PRUNE_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(PRUNE_KIT.elementalBurst.hits).talentMultiplier,
    ]).toStrictEqual([1.6744, 0.9696]);
  });

  test("her skill's hit lands at 26 frames as Anemo, cooling for 15 seconds", () => {
    expect.hasAssertions();
    const skillHit = takeOne(PRUNE_KIT.elementalSkill.hits);
    expect(skillHit.element).toBe(Element.Anemo);
    expect(Math.round(skillHit.hitmarkSeconds * 60)).toBe(26);
    expect(PRUNE_KIT.skillCooldownSeconds).toBe(15);
  });

  test("her burst's hit lands at 34 frames as Anemo, costing 70 energy and cooling for 18 seconds", () => {
    expect.hasAssertions();
    const burstHit = takeOne(PRUNE_KIT.elementalBurst.hits);
    expect(burstHit.element).toBe(Element.Anemo);
    expect(Math.round(burstHit.hitmarkSeconds * 60)).toBe(34);
    expect(PRUNE_KIT.burstEnergyCost).toBe(70);
    expect(PRUNE_KIT.burstCooldownSeconds).toBe(18);
  });
});
