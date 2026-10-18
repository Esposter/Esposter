import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { createIfaKitBehaviour, IFA_CHARACTER_ID } from "#src/services/kit/characters/ifaKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const IFA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, IFA_CHARACTER_ID);

const createIfaCombatant = (constellationCount = 0): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: IFA_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: IFA_KIT,
  level: 90,
});

describe(createIfaKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...IFA_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...IFA_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      IFA_KIT.plungeCollision.talentMultiplier,
      takeOne(IFA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(IFA_KIT.highPlunge.hits).talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([0.536072, 0.474672, 0.747584, 1.4704, 0.568288, 1.136335, 1.419344]);
  });

  test("the three normal attacks hit at their hitmarks and cancel into a walk at their table frames", () => {
    expect.hasAssertions();
    expect(
      IFA_KIT.normalAttacks.map(({ hits }) => hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))),
    ).toStrictEqual([[10], [13], [42]]);
    expect(IFA_KIT.normalAttacks.map(({ seconds }) => Math.round(seconds * 60))).toStrictEqual([27, 31, 88]);
  });

  test("the charged attack hits at 45 frames of an 86-frame animation, costing 50 stamina", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(IFA_KIT.chargedAttack.hits).hitmarkSeconds * 60)).toBe(45);
    expect(Math.round(IFA_KIT.chargedAttack.seconds * 60)).toBe(86);
    expect(IFA_KIT.chargedAttackStamina).toBe(50);
  });

  test("the burst's hit lands at 41 frames and costs 60 energy for 15 seconds, and the skill cools for 7.5 seconds", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(IFA_KIT.elementalBurst.hits).hitmarkSeconds * 60)).toBe(41);
    expect(IFA_KIT.burstEnergyCost).toBe(60);
    expect(IFA_KIT.burstCooldownSeconds).toBe(15);
    expect(IFA_KIT.skillCooldownSeconds).toBe(7.5);
  });

  test("the low plunge lands at 38 frames and the collision at 32", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(IFA_KIT.lowPlunge.hits).hitmarkSeconds * 60)).toBe(38);
    expect(Math.round(IFA_KIT.plungeCollision.hitmarkSeconds * 60)).toBe(32);
  });

  test("the skill's press enters the Nightsoul Blessing with 80 points, which drain eight a second, and a press in it leaves it", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createIfaCombatant());
    IFA_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 5);
    expect(countKitResource(context.kitEffectState.effects, IFA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBeCloseTo(40);
    IFA_KIT.elementalSkill.onStart?.(context);
    expect(
      findKitStatus(context.kitEffectState.effects, IFA_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID),
    ).toBeUndefined();
    expect(countKitResource(context.kitEffectState.effects, IFA_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(0);
  });
});
