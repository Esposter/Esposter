import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createEscoffierKitBehaviour, ESCOFFIER_CHARACTER_ID } from "#src/services/kit/characters/escoffierKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const ESCOFFIER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, ESCOFFIER_CHARACTER_ID);

describe(createEscoffierKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...ESCOFFIER_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...ESCOFFIER_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      ESCOFFIER_KIT.plungeCollision.talentMultiplier,
      takeOne(ESCOFFIER_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(ESCOFFIER_KIT.highPlunge.hits).talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([0.51551, 0.475933, 0.329995, 0.403327, 1.15412, 0.639324, 1.278377, 1.596762]);
  });

  test("the normal attack's hits land at their hitmarks, and the third strike has two", () => {
    expect.hasAssertions();
    expect(
      ESCOFFIER_KIT.normalAttacks.map(({ hits }) => hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))),
    ).toStrictEqual([[7], [16], [27, 40]]);
    expect(ESCOFFIER_KIT.normalAttacks.map(({ seconds }) => Math.round(seconds * 60))).toStrictEqual([22, 30, 62]);
  });

  test("the charged attack hits at 20 frames of a 65-frame animation, costing 25 stamina", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(ESCOFFIER_KIT.chargedAttack.hits).hitmarkSeconds * 60)).toBe(20);
    expect(Math.round(ESCOFFIER_KIT.chargedAttack.seconds * 60)).toBe(65);
    expect(ESCOFFIER_KIT.chargedAttackStamina).toBe(25);
  });

  test("the skill cools for 15 seconds, and the burst costs 60 energy for 15 seconds", () => {
    expect.hasAssertions();
    expect(ESCOFFIER_KIT.skillCooldownSeconds).toBe(15);
    expect(ESCOFFIER_KIT.burstCooldownSeconds).toBe(15);
    expect(ESCOFFIER_KIT.burstEnergyCost).toBe(60);
  });

  test("the low plunge lands at 41 frames and the high plunge at 43, with their gcsim poise", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(ESCOFFIER_KIT.lowPlunge.hits).hitmarkSeconds * 60)).toBe(41);
    expect(takeOne(ESCOFFIER_KIT.lowPlunge.hits).poiseDamage).toBe(100);
    expect(Math.round(takeOne(ESCOFFIER_KIT.highPlunge.hits).hitmarkSeconds * 60)).toBe(43);
    expect(takeOne(ESCOFFIER_KIT.highPlunge.hits).poiseDamage).toBe(150);
  });
});
