import type { KitHit } from "#src/models/kit/KitHit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { BENNETT_CHARACTER_ID } from "#src/services/kit/characters/bennettKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { tagKitHits } from "#src/services/kit/tagKitHits";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const BENNETT_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, BENNETT_CHARACTER_ID);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

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

  test("keeps the kind of attack a hit names, whatever list of the kit it sits in, beside its action's kind", () => {
    expect.hasAssertions();
    const hit: KitHit = {
      attackTag: AttackTag.ElementalSkill,
      hitArea: { angle: 2 * Math.PI, height: 2, radius: 1 },
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: 1,
    };
    const kit = tagKitHits({
      ...TRAVELER_KIT,
      normalAttacks: [{ ...takeOne(TRAVELER_KIT.normalAttacks), hits: [hit] }],
    });
    const { actionAttackTag, attackTag } = takeOne(takeOne(kit.normalAttacks).hits);

    expect({ actionAttackTag, attackTag }).toStrictEqual({
      actionAttackTag: AttackTag.NormalAttack,
      attackTag: AttackTag.ElementalSkill,
    });
  });
});
