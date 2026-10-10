import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { QIQI_CHARACTER_ID } from "#src/services/character/constants";
import { createQiqiKit } from "#src/services/kit/characters/qiqiKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const QIQI_KIT = createQiqiKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [QIQI_CHARACTER_ID]));

const createQiqiCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseHealth, value: 10_000 },
    { attribute: Attribute.BaseAttack, value: 1000 },
  ]),
  characterId: QIQI_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: QIQI_KIT,
  level: 90,
});

describe(createQiqiKit, () => {
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
  // The effects an action's start adds, as the kit's effects hold them
  const castEffects = (action: KitAction): KitEffect[] => {
    const kitEffectState: KitEffectState = { effects: [] };
    action.onStart?.({ body: kitBody, combatant: createQiqiCombatant(), kitEffectState });
    return kitEffectState.effects;
  };
  const castHerald = (): { field?: KitField; summon?: KitSummon } => {
    const effects = castEffects(QIQI_KIT.elementalSkill);
    return {
      field: effects.find((effect): effect is KitField => effect.kind === "field"),
      summon: effects.find((effect): effect is KitSummon => effect.kind === "summon"),
    };
  };

  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...QIQI_KIT.normalAttacks.flatMap((action) => action.hits.map((hit) => hit.talentMultiplier)),
      ...QIQI_KIT.chargedAttack.hits.map((hit) => hit.talentMultiplier),
      QIQI_KIT.plungeCollision.talentMultiplier,
      takeOne(QIQI_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(QIQI_KIT.highPlunge.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.37754, 0.38872, 0.24166, 0.24166, 0.24682, 0.24682, 0.63038, 0.64328, 0.64328, 0.639324, 1.278377, 1.596762,
    ];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("the press's initial damage lands at 32 frames, and its swipes at the nine frames gcsim gives", () => {
    expect.hasAssertions();
    const { summon } = castHerald();
    const [initialHit, ...swipeHits] = summon?.hits ?? [];

    expect(summon?.isFollowing).toBe(true);
    expect(summon?.secondsRemaining).toBe(15);
    expect(initialHit?.hitmarkSeconds).toBeCloseTo(32 / 60);
    expect(initialHit?.talentMultiplier).toBeCloseTo(0.96);
    expect(swipeHits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))).toStrictEqual([
      96, 231, 291, 426, 486, 621, 681, 816, 876,
    ]);
    expect(swipeHits.every(({ talentMultiplier }) => talentMultiplier === 0.36)).toBe(true);
  });

  test("the regeneration ticks every 4.5 seconds from the press's hitmark, for the skill's 15 seconds", () => {
    expect.hasAssertions();
    const { field } = castHerald();

    expect(field?.nextTickSeconds).toBeCloseTo(32 / 60);
    expect(field?.radius).toBe(Number.POSITIVE_INFINITY);
    expect(field?.secondsRemaining).toBe(15);
    expect(field?.tickIntervalSeconds).toBe(4.5);
  });

  test("a normal or charged attack hit regenerates the party only while Herald of Frost stands", () => {
    expect.hasAssertions();
    const [hit] = takeOne(QIQI_KIT.normalAttacks).hits;
    const combatant = createQiqiCombatant();
    const { summon } = castHerald();
    const healParty = hit?.healParty;

    expect(healParty?.chance(combatant, [])).toBe(0);
    expect(healParty?.chance(combatant, summon ? [summon] : [])).toBe(1);
    expect(healParty?.isUnshielded).toBe(true);
    expect(healParty?.flatHealth).toBeCloseTo(67.40786);
    expect(healParty?.attackShare).toBeCloseTo(0.1056);
  });

  test("the plunges and the skill's damage carry no regeneration on hit", () => {
    expect.hasAssertions();

    expect(QIQI_KIT.lowPlunge.hits[0]?.healParty).toBeUndefined();
    expect(QIQI_KIT.highPlunge.hits[0]?.healParty).toBeUndefined();
    expect(QIQI_KIT.elementalSkill.hits).toStrictEqual([]);
  });

  test("the skill's cooldown, the burst's cooldown and energy cost come from the dump's groups", () => {
    expect.hasAssertions();

    expect(QIQI_KIT.skillCooldownSeconds).toBe(30);
    expect(QIQI_KIT.burstCooldownSeconds).toBe(20);
    expect(QIQI_KIT.burstEnergyCost).toBe(80);
    expect(QIQI_KIT.chargedAttackStamina).toBe(20);
  });
});
