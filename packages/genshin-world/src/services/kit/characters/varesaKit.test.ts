import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createVaresaKit, VARESA_CHARACTER_ID } from "#src/services/kit/characters/varesaKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const VARESA_KIT = createVaresaKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [VARESA_CHARACTER_ID]));

describe(createVaresaKit, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...VARESA_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...VARESA_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      VARESA_KIT.plungeCollision.talentMultiplier,
      takeOne(VARESA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(VARESA_KIT.highPlunge.hits).talentMultiplier,
      takeOne(VARESA_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(VARESA_KIT.elementalBurst.hits).talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.467784, 0.40028, 0.563128, 0.8928, 0.745878, 1.49144, 1.862889, 0.7448, 3.4512,
    ]);
  });

  test("the three strikes hit at their hitmarks and cancel into a walk at their table frames", () => {
    expect.hasAssertions();
    expect(
      VARESA_KIT.normalAttacks.map(({ hits }) => hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))),
    ).toStrictEqual([[23], [7], [33]]);
    expect(VARESA_KIT.normalAttacks.map(({ seconds }) => Math.round(seconds * 60))).toStrictEqual([49, 28, 59]);
  });

  test("the charged attack hits at 69 frames of a 143-frame animation, costing 50 stamina", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(VARESA_KIT.chargedAttack.hits).hitmarkSeconds * 60)).toBe(69);
    expect(Math.round(VARESA_KIT.chargedAttack.seconds * 60)).toBe(143);
    expect(VARESA_KIT.chargedAttackStamina).toBe(50);
  });

  test("the skill has two charges on a 9-second cooldown, and the burst costs 70 energy for 18 seconds", () => {
    expect.hasAssertions();
    expect(VARESA_KIT.elementalSkillCharges).toBe(2);
    expect(VARESA_KIT.skillCooldownSeconds).toBe(9);
    expect(VARESA_KIT.burstCooldownSeconds).toBe(18);
    expect(VARESA_KIT.burstEnergyCost).toBe(70);
  });

  test("the low plunge lands at 37 frames and the high plunge at 38, with the collision at 31", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(VARESA_KIT.lowPlunge.hits).hitmarkSeconds * 60)).toBe(37);
    expect(Math.round(takeOne(VARESA_KIT.highPlunge.hits).hitmarkSeconds * 60)).toBe(38);
    expect(Math.round(VARESA_KIT.plungeCollision.hitmarkSeconds * 60)).toBe(31);
  });
});
