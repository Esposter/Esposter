import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ARLECCHINO_CHARACTER_ID, createArlecchinoKitBehaviour } from "#src/services/kit/characters/arlecchinoKit";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const ARLECCHINO_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, ARLECCHINO_CHARACTER_ID);
const createArlecchinoCombatant = (ascension: number): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: ARLECCHINO_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: ARLECCHINO_KIT,
  level: 90,
});
const toFrames = (seconds: number) => Math.round(seconds * 60);

describe(createArlecchinoKitBehaviour, () => {
  test("reads her six strikes, charged attack and plunges from her proud attack group", () => {
    expect.hasAssertions();
    const multipliers = [
      ...ARLECCHINO_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      takeOne(ARLECCHINO_KIT.chargedAttack.hits).talentMultiplier,
      ARLECCHINO_KIT.plungeCollision.talentMultiplier,
      takeOne(ARLECCHINO_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(ARLECCHINO_KIT.highPlunge.hits).talentMultiplier,
    ];
    // The fourth strike's two hits both read index 3
    const expectedMultipliers = [0.475, 0.5211, 0.6539, 0.3715, 0.3715, 0.6998, 0.8538, 0.9082, 0.6393, 1.2784, 1.5968];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 3);
  });

  test("lands her strikes at gcsim's hitmarks, the fourth's two hits at 24 and 35 frames", () => {
    expect.hasAssertions();

    expect(
      ARLECCHINO_KIT.normalAttacks.map((action) => ({
        frames: toFrames(action.seconds),
        hitmarks: action.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds)),
      })),
    ).toStrictEqual([
      { frames: 24, hitmarks: [11] },
      { frames: 31, hitmarks: [16] },
      { frames: 39, hitmarks: [17] },
      { frames: 55, hitmarks: [24, 35] },
      { frames: 43, hitmarks: [21] },
      { frames: 59, hitmarks: [44] },
    ]);
  });

  test("the charged attack lands at 37 frames of 60, and costs 25 stamina", () => {
    expect.hasAssertions();

    expect(toFrames(ARLECCHINO_KIT.chargedAttack.seconds)).toBe(60);
    expect(toFrames(takeOne(ARLECCHINO_KIT.chargedAttack.hits).hitmarkSeconds)).toBe(37);
    expect(ARLECCHINO_KIT.chargedAttackStamina).toBe(25);
  });

  test("her plunges land at gcsim's hitmarks, with the collision at 41 frames and their poise of 100 and 150", () => {
    expect.hasAssertions();

    expect(toFrames(ARLECCHINO_KIT.plungeCollision.hitmarkSeconds)).toBe(41);
    expect(toFrames(takeOne(ARLECCHINO_KIT.lowPlunge.hits).hitmarkSeconds)).toBe(47);
    expect(toFrames(takeOne(ARLECCHINO_KIT.highPlunge.hits).hitmarkSeconds)).toBe(48);
    expect(takeOne(ARLECCHINO_KIT.lowPlunge.hits).poiseDamage).toBe(100);
    expect(takeOne(ARLECCHINO_KIT.highPlunge.hits).poiseDamage).toBe(150);
  });

  test("her skill is Spike at 17 frames and Cleave at 38, on a 30 second cooldown", () => {
    expect.hasAssertions();

    expect(toFrames(ARLECCHINO_KIT.elementalSkill.seconds)).toBe(77);
    expect(ARLECCHINO_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) => toFrames(hitmarkSeconds))).toStrictEqual([
      17, 38,
    ]);
    expect(ARLECCHINO_KIT.elementalSkill.hits.map(({ talentMultiplier }) => talentMultiplier)).toStrictEqual([
      expect.closeTo(0.1484, 3),
      expect.closeTo(1.3356, 3),
    ]);
    expect(ARLECCHINO_KIT.skillCooldownSeconds).toBe(30);
  });

  test("her burst lands at 110 frames of 146, costs 60 energy and recharges in 15 seconds", () => {
    expect.hasAssertions();
    const [burstHit] = ARLECCHINO_KIT.elementalBurst.hits;

    expect(toFrames(ARLECCHINO_KIT.elementalBurst.seconds)).toBe(146);
    expect(toFrames(burstHit?.hitmarkSeconds ?? 0)).toBe(110);
    expect(burstHit?.talentMultiplier).toBeCloseTo(3.704, 3);
    expect(ARLECCHINO_KIT.burstEnergyCost).toBe(60);
    expect(ARLECCHINO_KIT.burstCooldownSeconds).toBe(15);
  });

  // Her utility passive, The Balemoon Alone May Know, has no ascension phase: it holds from the start, below every phase
  test("the utility passive, The Balemoon Alone May Know, takes effect at its ascension phase", () => {
    expect.hasAssertions();
    const combatant = createArlecchinoCombatant(0);
    const { party } = createKitTestContext(combatant);

    expect(
      getBuffedCombatant(combatant, [], party, new Map()).attributes.attributeTotalMap[Attribute.PyroDamageBonus],
    ).toBe(0.4);
  });

  test("her burst resets her skill's cooldown 107 frames after it starts", () => {
    expect.hasAssertions();
    const combatant = createArlecchinoCombatant(0);
    const context = createKitTestContext(combatant);
    getPartyMember(context.party, ARLECCHINO_CHARACTER_ID).skillCooldownSeconds = 20;
    ARLECCHINO_KIT.elementalBurst.onStart?.(context);
    stepKitSeconds(context, toKitSeconds(106));
    expect(getPartyMember(context.party, ARLECCHINO_CHARACTER_ID).skillCooldownSeconds).toBeGreaterThan(0);
    stepKitSeconds(context, toKitSeconds(2));
    expect(getPartyMember(context.party, ARLECCHINO_CHARACTER_ID).skillCooldownSeconds).toBe(0);
  });
});
