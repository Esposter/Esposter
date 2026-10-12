import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { CHIORI_CHARACTER_ID, createChioriKitBehaviour } from "#src/services/kit/characters/chioriKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const CHIORI_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, CHIORI_CHARACTER_ID);

const createChioriCombatant = (defense: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseDefense, value: defense }]),
  characterId: CHIORI_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: CHIORI_KIT,
  level: 90,
});

// The summons an action's start casts, as the kit's effects hold them
const castSummons = (action: KitAction, combatant: Combatant): KitSummon[] => {
  const context = createKitTestContext(combatant);
  action.onStart?.(context);
  return context.kitEffectState.effects.filter((effect) => effect.kind === "summon");
};

describe(createChioriKitBehaviour, () => {
  test("reads each talent multiplier from her proud skill groups, to gcsim's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...CHIORI_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...CHIORI_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      CHIORI_KIT.plungeCollision.talentMultiplier,
      takeOne(CHIORI_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(CHIORI_KIT.highPlunge.hits).talentMultiplier,
      takeOne(CHIORI_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(takeOne(castSummons(CHIORI_KIT.elementalSkill, createChioriCombatant(0))).hits).talentMultiplier,
      takeOne(CHIORI_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.4941, 0.4683, 0.3042, 0.3042, 0.7512, 0.5431, 0.5431, 0.6393, 1.2784, 1.5968, 1.4928, 0.8208, 2.5632,
    ];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 3);
  });

  test("her charged attack's stamina is the table's 20, and its burst costs 50 energy on a 13.5 second cooldown", () => {
    expect.hasAssertions();

    expect(CHIORI_KIT.chargedAttackStamina).toBe(20);
    expect(CHIORI_KIT.burstEnergyCost).toBe(50);
    expect(CHIORI_KIT.burstCooldownSeconds).toBe(13.5);
    expect(CHIORI_KIT.skillCooldownSeconds).toBe(16);
  });

  test("her strikes land at gcsim's hitmarks, the third's second hit at 32 frames, each within its animation", () => {
    expect.hasAssertions();

    expect(
      CHIORI_KIT.normalAttacks.map(({ hits, seconds }) => ({
        frames: Math.round(seconds * 60),
        hitmarks: hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
      })),
    ).toStrictEqual([
      { frames: 22, hitmarks: [17] },
      { frames: 33, hitmarks: [16] },
      { frames: 42, hitmarks: [24, 32] },
      { frames: 59, hitmarks: [37] },
    ]);
  });

  test("the upward sweep prices its DEF share of her Defense, and a press holds Tamoto for 17.5 seconds from its cast", () => {
    expect.hasAssertions();
    const combatant = createChioriCombatant(1000);
    const sweep = takeOne(CHIORI_KIT.elementalSkill.hits);
    const summon = takeOne(castSummons(CHIORI_KIT.elementalSkill, combatant));

    expect(Math.round(sweep.additiveBaseDamageBonus?.(combatant) ?? Number.NaN)).toBe(1866);
    expect(summon.secondsRemaining * 60).toBeCloseTo(19 + 1050);
    expect(summon.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))).toStrictEqual([
      60, 276, 492, 708, 924,
    ]);
    expect(Math.round(takeOne(summon.hits).additiveBaseDamageBonus?.(combatant) ?? Number.NaN)).toBe(1026);
  });

  test("a hold casts Tamoto at 34 frames, and needs the provisional half second to be held", () => {
    expect.hasAssertions();
    const hold = takeOne(CHIORI_KIT.elementalSkillHolds ?? []);
    const summon = takeOne(castSummons(hold.action, createChioriCombatant(0)));

    expect(hold.minimumHeldSeconds).toBe(0.5);
    expect(summon.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))).toStrictEqual([
      75, 291, 507, 723, 939,
    ]);
    expect(summon.secondsRemaining * 60).toBeCloseTo(34 + 1050);
  });

  test("her burst strikes at 92 frames as a circle of 12 metres, priced by her DEF share", () => {
    expect.hasAssertions();
    const combatant = createChioriCombatant(1000);
    const [burstHit] = CHIORI_KIT.elementalBurst.hits;

    expect(Math.round((burstHit?.hitmarkSeconds ?? 0) * 60)).toBe(92);
    expect(Math.round(burstHit?.additiveBaseDamageBonus?.(combatant) ?? Number.NaN)).toBe(3204);
  });
});
