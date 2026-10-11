import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { HEIZOU_CHARACTER_ID } from "#src/services/character/constants";
import { createHeizouKit } from "#src/services/kit/characters/heizouKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const HEIZOU_KIT = createHeizouKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [HEIZOU_CHARACTER_ID]));

describe(createHeizouKit, () => {
  test("the strikes, the fourth's three hits, the charged attack and the plunges read their table indexes at talent level 1", () => {
    expect.hasAssertions();
    const normalAttackMultipliers = HEIZOU_KIT.normalAttacks.map(({ hits }) =>
      hits.map(({ talentMultiplier }) => talentMultiplier),
    );

    expect(normalAttackMultipliers).toStrictEqual([
      [0.374736],
      [0.36852],
      [0.5106],
      [0.147824, 0.162608, 0.192176],
      [0.614496],
    ]);
    expect(HEIZOU_KIT.chargedAttack.hits[0]?.talentMultiplier).toBe(0.73);
    expect(HEIZOU_KIT.chargedAttackStamina).toBe(25);
    expect(HEIZOU_KIT.plungeCollision.talentMultiplier).toBe(0.568288);
    expect(HEIZOU_KIT.lowPlunge.hits[0]?.talentMultiplier).toBe(1.136335);
    expect(HEIZOU_KIT.highPlunge.hits[0]?.talentMultiplier).toBe(1.419344);
  });

  test("the full hold strikes with four Declension stacks and its Conviction bonus, from three seconds", () => {
    expect.hasAssertions();
    const [hold] = HEIZOU_KIT.elementalSkillHolds ?? [];

    expect(hold?.minimumHeldSeconds).toBe(3);
    expect(hold?.action.hits[0]?.talentMultiplier).toBeCloseTo(2.2752 + 4 * 0.5688 + 1.1376, 10);
    expect(HEIZOU_KIT.elementalSkill.hits[0]?.talentMultiplier).toBe(2.2752);
  });

  test("the skill, burst and burst's energy read their cooldowns and cost from the proud skill groups", () => {
    expect.hasAssertions();

    expect({
      burstCooldownSeconds: HEIZOU_KIT.burstCooldownSeconds,
      burstEnergyCost: HEIZOU_KIT.burstEnergyCost,
      skillCooldownSeconds: HEIZOU_KIT.skillCooldownSeconds,
    }).toStrictEqual({ burstCooldownSeconds: 12, burstEnergyCost: 40, skillCooldownSeconds: 10 });
  });
});
