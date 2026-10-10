import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { BENNETT_CHARACTER_ID, TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createBennettKit } from "#src/services/kit/characters/bennettKit";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { getKitAttackTag } from "#src/services/kit/getKitAttackTag";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const BENNETT_KIT = createBennettKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [BENNETT_CHARACTER_ID]));
const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

describe(getKitAttackTag, () => {
  test.each([
    [AttackTag.NormalAttack, takeOne(takeOne(TRAVELER_KIT.normalAttacks).hits)],
    [AttackTag.ChargedAttack, takeOne(TRAVELER_KIT.chargedAttack.hits)],
    [AttackTag.PlungingAttack, TRAVELER_KIT.plungeCollision],
    [AttackTag.PlungingAttack, takeOne(TRAVELER_KIT.highPlunge.hits)],
    [AttackTag.ElementalSkill, takeOne(TRAVELER_KIT.elementalSkill.hits)],
    [AttackTag.ElementalBurst, takeOne(TRAVELER_KIT.elementalBurst.hits)],
  ])("reads %s off the action a hit belongs to", (attackTag, hit) => {
    expect.hasAssertions();

    expect(getKitAttackTag(TRAVELER_KIT, hit)).toBe(attackTag);
  });

  test("reads a skill hold's hit as the skill's, and a hit no action holds as none", () => {
    expect.hasAssertions();
    const holdHit = takeOne(takeOne(BENNETT_KIT.elementalSkillHolds ?? []).action.hits);

    expect(getKitAttackTag(BENNETT_KIT, holdHit)).toBe(AttackTag.ElementalSkill);
    expect(getKitAttackTag(BENNETT_KIT, { ...holdHit })).toBeUndefined();
  });
});
