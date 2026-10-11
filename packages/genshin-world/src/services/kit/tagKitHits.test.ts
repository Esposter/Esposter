import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { BENNETT_CHARACTER_ID, createBennettKit } from "#src/services/kit/characters/bennettKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { tagKitHits } from "#src/services/kit/tagKitHits";
import { createTravelerKit } from "#src/services/kit/travelerKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const BENNETT_KIT = tagKitHits(
  createBennettKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [BENNETT_CHARACTER_ID])),
);
const TRAVELER_KIT = tagKitHits(
  createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID])),
);

describe(tagKitHits, () => {
  test.each([
    [AttackTag.NormalAttack, takeOne(takeOne(TRAVELER_KIT.normalAttacks).hits)],
    [AttackTag.ChargedAttack, takeOne(TRAVELER_KIT.chargedAttack.hits)],
    [AttackTag.PlungingAttack, TRAVELER_KIT.plungeCollision],
    [AttackTag.PlungingAttack, takeOne(TRAVELER_KIT.highPlunge.hits)],
    [AttackTag.ElementalSkill, takeOne(TRAVELER_KIT.elementalSkill.hits)],
    [AttackTag.ElementalBurst, takeOne(TRAVELER_KIT.elementalBurst.hits)],
  ])("tags %s on the hit of the action it belongs to", (attackTag, hit) => {
    expect.hasAssertions();

    expect(hit.attackTag).toBe(attackTag);
  });

  test("tags a skill hold's hit as the skill's", () => {
    expect.hasAssertions();

    expect(takeOne(takeOne(BENNETT_KIT.elementalSkillHolds ?? []).action.hits).attackTag).toBe(
      AttackTag.ElementalSkill,
    );
  });

  test("keeps the kind of attack a hit names, whatever list of the kit it sits in", () => {
    expect.hasAssertions();
    const hit = { ...takeOne(takeOne(TRAVELER_KIT.normalAttacks).hits), attackTag: AttackTag.ElementalSkill };
    const kit = tagKitHits({
      ...TRAVELER_KIT,
      normalAttacks: [{ ...takeOne(TRAVELER_KIT.normalAttacks), hits: [hit] }],
    });

    expect(takeOne(takeOne(kit.normalAttacks).hits).attackTag).toBe(AttackTag.ElementalSkill);
  });
});
