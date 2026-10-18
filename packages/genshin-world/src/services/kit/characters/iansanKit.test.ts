import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { castKitAction, createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { createIansanKitBehaviour, IANSAN_CHARACTER_ID } from "#src/services/kit/characters/iansanKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const IANSAN_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, IANSAN_CHARACTER_ID);

const createIansanCombatant = (constellationCount = 0): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: IANSAN_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: IANSAN_KIT,
  level: 90,
});

describe(createIansanKitBehaviour, () => {
  test("reads each talent multiplier, cooldown and cost from her proud skill groups, to four decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...IANSAN_KIT.normalAttacks.map(({ hits }) => hits[0]?.talentMultiplier),
      IANSAN_KIT.chargedAttack.hits[0]?.talentMultiplier,
      IANSAN_KIT.plungeCollision.talentMultiplier,
      IANSAN_KIT.lowPlunge.hits[0]?.talentMultiplier,
      IANSAN_KIT.highPlunge.hits[0]?.talentMultiplier,
      IANSAN_KIT.elementalSkill.hits[0]?.talentMultiplier,
      IANSAN_KIT.elementalBurst.hits[0]?.talentMultiplier,
    ].map((multiplier) => Number(multiplier?.toFixed(4)));

    expect(multipliers).toStrictEqual([0.4698, 0.4276, 0.6439, 1.0028, 0.6393, 1.2784, 1.5968, 2.864, 4.304]);
    expect([
      IANSAN_KIT.chargedAttackStamina,
      IANSAN_KIT.skillCooldownSeconds,
      IANSAN_KIT.burstCooldownSeconds,
      IANSAN_KIT.burstEnergyCost,
    ]).toStrictEqual([25, 16, 18, 70]);
  });

  test("lands her strikes at their hitmarks, her charged attack at 21 frames, her skill's activation at 9, and her burst at 38", () => {
    expect.hasAssertions();
    expect({
      burstHitmarkFrames: IANSAN_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
      chargedAttackHitmarkFrames: IANSAN_KIT.chargedAttack.hits.map(({ hitmarkSeconds }) =>
        Math.round(hitmarkSeconds * 60),
      ),
      normalAttackHitmarkFrames: IANSAN_KIT.normalAttacks.map(({ hits }) =>
        Math.round((hits[0]?.hitmarkSeconds ?? 0) * 60),
      ),
      skillHitmarkFrames: IANSAN_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
    }).toStrictEqual({
      burstHitmarkFrames: [38],
      chargedAttackHitmarkFrames: [21],
      normalAttackHitmarkFrames: [14, 7, 22],
      skillHitmarkFrames: [9],
    });
  });

  test("the skill's press enters the Nightsoul Blessing with 54 points, which drain six a second, and ends it at none", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createIansanCombatant());
    IANSAN_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 2);
    expect(countKitResource(context.kitEffectState.effects, IANSAN_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBeCloseTo(42);
    stepKitSeconds(context, 8);
    expect(
      findKitStatus(context.kitEffectState.effects, IANSAN_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID),
    ).toBeUndefined();
  });

  test("a Constellation 1 blessing gives Iansan 15 energy for each 6 points consumed, then waits 18 seconds for the next", () => {
    expect.hasAssertions();
    const combatant = createIansanCombatant(1);
    const kitEffectState = castKitAction(IANSAN_KIT.elementalSkill, combatant);
    const context = createKitTestContext(combatant, { kitEffectState });
    stepKitSeconds(context, 1);
    expect(getPartyMember(context.party, IANSAN_CHARACTER_ID).energy).toBe(15);

    stepKitSeconds(context, 9);
    castKitAction(IANSAN_KIT.elementalSkill, combatant, kitEffectState);
    stepKitSeconds(context, 9.5);
    expect(getPartyMember(context.party, IANSAN_CHARACTER_ID).energy).toBe(15);

    castKitAction(IANSAN_KIT.elementalSkill, combatant, kitEffectState);
    stepKitSeconds(context, 1.5);
    expect(getPartyMember(context.party, IANSAN_CHARACTER_ID).energy).toBe(30);
  });

  test("a Constellation 0 blessing gives Iansan no energy", () => {
    expect.hasAssertions();
    const combatant = createIansanCombatant();
    const context = createKitTestContext(combatant, {
      kitEffectState: castKitAction(IANSAN_KIT.elementalSkill, combatant),
    });
    stepKitSeconds(context, 9);

    expect(getPartyMember(context.party, IANSAN_CHARACTER_ID).energy).toBe(0);
  });
});
