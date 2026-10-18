import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { castKitAction, createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { generateKitNightsoulPoints } from "#src/services/kit/effects/generateKitNightsoulPoints";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import {
  createIansanKitBehaviour,
  IANSAN_CHARACTER_ID,
  IANSAN_WARMING_UP_ID,
} from "#src/services/kit/characters/iansanKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { triggerKitNightsoulBurst } from "#src/services/kit/triggerKitNightsoulBurst";
import { NATLAN_REGION_ID } from "#src/services/natlan/constants";
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

  test("the Electro Swift Stormflight replaces her charged attack while the blessing lasts", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createIansanCombatant());
    expect(IANSAN_KIT.chargedAttackVariant?.checkIsActive(context)).toBe(false);
    IANSAN_KIT.elementalSkill.onStart?.(context);
    expect(IANSAN_KIT.chargedAttackVariant?.checkIsActive(context)).toBe(true);
    stepKitSeconds(context, 17);
    expect(IANSAN_KIT.chargedAttackVariant?.checkIsActive(context)).toBe(false);
  });

  test("a passive takes effect at its ascension phase: the Stormflight's strike gives Iansan 20% ATK for 15 seconds from Ascension 1", () => {
    expect.hasAssertions();
    const combatant = { ...createIansanCombatant(), ascension: 1 };
    const context = createKitTestContext(combatant);
    IANSAN_KIT.chargedAttackVariant?.action.hits[0]?.onStrike?.(context, {} as KitStrike, {} as Enemy);
    expect(IANSAN_KIT.getPassiveBonuses?.(combatant, 1, [], context.kitEffectState.effects)).toStrictEqual([
      { amount: 0.2, attribute: Attribute.AttackPercent },
    ]);
    stepKitSeconds(context, 14);
    expect(IANSAN_KIT.getPassiveBonuses?.(combatant, 1, [], context.kitEffectState.effects)).toHaveLength(1);
    stepKitSeconds(context, 2);
    expect(IANSAN_KIT.getPassiveBonuses?.(combatant, 1, [], context.kitEffectState.effects)).toStrictEqual([]);
  });

  test("does not take effect below its ascension phase: the Stormflight's strike gives Iansan no ATK below Ascension 1", () => {
    expect.hasAssertions();
    const combatant = createIansanCombatant();
    const context = createKitTestContext(combatant);
    IANSAN_KIT.chargedAttackVariant?.action.hits[0]?.onStrike?.(context, {} as KitStrike, {} as Enemy);
    expect(IANSAN_KIT.getPassiveBonuses?.(combatant, 1, [], context.kitEffectState.effects)).toStrictEqual([]);
  });

  test("a passive takes effect at its ascension phase: Precise Movement ends with the blessing that drains out, taking Iansan's 20% ATK with it", () => {
    expect.hasAssertions();
    const combatant = { ...createIansanCombatant(), ascension: 1 };
    const context = createKitTestContext(combatant);
    IANSAN_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 1);
    IANSAN_KIT.chargedAttackVariant?.action.hits[0]?.onStrike?.(context, {} as KitStrike, {} as Enemy);
    // Her 54 points drain out at nine seconds, and Precise Movement, which lasts to 16 seconds, goes with them
    stepKitSeconds(context, 7);
    expect(IANSAN_KIT.getPassiveBonuses?.(combatant, 1, [], context.kitEffectState.effects)).toHaveLength(1);
    stepKitSeconds(context, 2);
    expect(IANSAN_KIT.getPassiveBonuses?.(combatant, 1, [], context.kitEffectState.effects)).toStrictEqual([]);
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
  const countIansanPoints = (context: KitContext) =>
    countKitResource(context.kitEffectState.effects, IANSAN_CHARACTER_ID, NIGHTSOUL_POINTS_ID);
  // Iansan's burst lands on a blessing of the points given, with no drain, so only the burst and her Ascension 1 move it
  const landIansanBurst = (combatant: Combatant, points = 20) => {
    const context = createKitTestContext(combatant);
    if (combatant.ascension >= 1)
      IANSAN_KIT.chargedAttackVariant?.action.hits[0]?.onStrike?.(context, {} as KitStrike, {} as Enemy);
    enterKitNightsoulBlessing(context.kitEffectState, IANSAN_CHARACTER_ID, { points, secondsRemaining: 16 });
    IANSAN_KIT.elementalBurst.onStart?.(context);
    return context;
  };

  test("the burst gains 15 points on a held blessing 0.67 seconds after it lands", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createIansanCombatant());
    enterKitNightsoulBlessing(context.kitEffectState, IANSAN_CHARACTER_ID, { points: 20, secondsRemaining: 16 });
    IANSAN_KIT.elementalBurst.onStart?.(context);
    stepKitSeconds(context, 0.5);
    expect(countIansanPoints(context)).toBe(20);
    stepKitSeconds(context, 0.2);
    expect(countIansanPoints(context)).toBe(35);
  });

  test("the burst enters a 16-second blessing with 15 points, draining them, when none is held", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createIansanCombatant());
    IANSAN_KIT.elementalBurst.onStart?.(context);
    stepKitSeconds(context, 0.7);
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, IANSAN_CHARACTER_ID)).toBe(true);
    expect(countIansanPoints(context)).toBeCloseTo(15, 0);
  });

  test("a passive takes effect at its ascension phase: with Precise Movement up, the burst's points are restored once a second, four on the first after her points are gained", () => {
    expect.hasAssertions();
    const context = landIansanBurst({ ...createIansanCombatant(), ascension: 1 });
    stepKitSeconds(context, 1.2);
    expect(countIansanPoints(context)).toBe(39);
    stepKitSeconds(context, 1);
    expect(countIansanPoints(context)).toBe(40);
  });

  test("does not take effect below its ascension phase: the burst's restore gives Iansan no points below Ascension 1", () => {
    expect.hasAssertions();
    const context = landIansanBurst(createIansanCombatant());
    stepKitSeconds(context, 2.2);
    expect(countIansanPoints(context)).toBe(35);
  });

  test("a passive takes effect at its ascension phase: its four points wait out their 2.8-second cooldown after each arming", () => {
    expect.hasAssertions();
    const context = landIansanBurst({ ...createIansanCombatant(), ascension: 1 });
    // Armed by the burst's 15 at 0.67 seconds, so the gain at 1.5 seconds falls in its cooldown and arms nothing
    stepKitSeconds(context, 1.5);
    generateKitNightsoulPoints(context, 1, 54);
    stepKitSeconds(context, 2.1);
    generateKitNightsoulPoints(context, 1, 54);
    stepKitSeconds(context, 0.9);
    // 35 from the burst, 4 at 1 second, 1 at 2 and 3 seconds, then 1 gained at 3.6 seconds and 4 at 4 seconds
    expect(countIansanPoints(context)).toBe(47);
  });

  // Iansan on the field in Natlan with 1000 ATK, her burst landed and a Nightsoul burst set off, her HP at half so a heal shows
  const createWarmingUpIansan = (ascension: number) => {
    const combatant: Combatant = {
      ...createIansanCombatant(),
      ascension,
      attributes: computeCharacterAttributes([
        { attribute: Attribute.BaseHealth, value: 10_000 },
        { attribute: Attribute.BaseAttack, value: 1000 },
      ]),
      regionId: NATLAN_REGION_ID,
    };
    const context = landIansanBurst(combatant);
    triggerKitNightsoulBurst({} as Enemy, combatant, context);
    getPartyMember(context.party, IANSAN_CHARACTER_ID).healthShare = 0.5;
    return context;
  };
  const healthShareOf = (context: KitContext) => getPartyMember(context.party, IANSAN_CHARACTER_ID).healthShare;

  test("a passive takes effect at its ascension phase: a Nightsoul burst gives Iansan Warming Up, and her restore heals the active character for 60% of her ATK", () => {
    expect.hasAssertions();
    const context = createWarmingUpIansan(4);
    stepKitSeconds(context, 1.2);
    // 60% of her 1200 ATK, with Precise Movement's 20% in it, is 720 HP of her 10,000 Max HP
    expect(healthShareOf(context)).toBeCloseTo(0.572);
  });

  test("does not take effect below its ascension phase: Iansan below Ascension 4 gets no Warming Up heal", () => {
    expect.hasAssertions();
    const context = createWarmingUpIansan(3);
    stepKitSeconds(context, 1.2);
    expect(healthShareOf(context)).toBe(0.5);
  });

  test("a passive takes effect at its ascension phase: Warming Up's heal waits out a 2.8-second cooldown after each heal", () => {
    expect.hasAssertions();
    const context = createWarmingUpIansan(4);
    stepKitSeconds(context, 1.2);
    stepKitSeconds(context, 2);
    expect(healthShareOf(context)).toBeCloseTo(0.572);
    stepKitSeconds(context, 1);
    expect(healthShareOf(context)).toBeCloseTo(0.644);
  });

  test("a passive takes effect at its ascension phase: Warming Up lasts 10 seconds from the Nightsoul burst", () => {
    expect.hasAssertions();
    const context = createWarmingUpIansan(4);
    stepKitSeconds(context, 9.5);
    expect(checkIsKitStatusActive(context.kitEffectState.effects, IANSAN_CHARACTER_ID, IANSAN_WARMING_UP_ID)).toBe(
      true,
    );
    stepKitSeconds(context, 1);
    expect(checkIsKitStatusActive(context.kitEffectState.effects, IANSAN_CHARACTER_ID, IANSAN_WARMING_UP_ID)).toBe(
      false,
    );
  });

  test("the burst's restore runs a second for its 12 seconds, and not after", () => {
    expect.hasAssertions();
    // Her points stay under the 54 cap. The restore's ticks at 1 to 11 seconds give 23 from the burst's 15: the armed 4
    // Comes on the first, then her own generations re-arm it when the 2.8-second cooldown ends, at 4, 7 and 10 seconds,
    // As gcsim's generate callback does, so a 4 follows at 5, 8 and 11 seconds
    const context = landIansanBurst({ ...createIansanCombatant(), ascension: 1 }, 10);
    stepKitSeconds(context, 13);
    expect(countIansanPoints(context)).toBe(48);
  });

  test("the burst's restore stops once the blessing it lands in ends", () => {
    expect.hasAssertions();
    const combatant = { ...createIansanCombatant(), ascension: 1 };
    const context = createKitTestContext(combatant);
    IANSAN_KIT.chargedAttackVariant?.action.hits[0]?.onStrike?.(context, {} as KitStrike, {} as Enemy);
    IANSAN_KIT.elementalBurst.onStart?.(context);
    stepKitSeconds(context, 6);
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, IANSAN_CHARACTER_ID)).toBe(false);
    expect(countIansanPoints(context)).toBe(0);
  });

  test("a skill re-entry inside the burst's 12 seconds does not resume the burst's restore", () => {
    expect.hasAssertions();
    const combatant = { ...createIansanCombatant(), ascension: 1 };
    const context = createKitTestContext(combatant);
    IANSAN_KIT.elementalBurst.onStart?.(context);
    // The burst's 15 points drain out at about 3.2 seconds, which ends that blessing and with it the restore
    stepKitSeconds(context, 4);
    expect(hasKitNightsoulBlessing(context.kitEffectState.effects, IANSAN_CHARACTER_ID)).toBe(false);
    // The skill re-enters at 4 seconds and a strike brings Precise Movement back, so only the restore is missing
    IANSAN_KIT.elementalSkill.onStart?.(context);
    IANSAN_KIT.chargedAttackVariant?.action.hits[0]?.onStrike?.(context, {} as KitStrike, {} as Enemy);
    stepKitSeconds(context, 1.2);
    // Past the 5-second tick, which with the restore would give 4 points armed by the drain: only the drain shows
    expect(countIansanPoints(context)).toBeCloseTo(54 - 6 * 1.2);
  });
});
