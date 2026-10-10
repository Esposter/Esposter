import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Elements } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ZHONGLI_CHARACTER_ID } from "#src/services/character/constants";
import { createZhongliKit } from "#src/services/kit/characters/zhongliKit";
import { absorbKitShield } from "#src/services/kit/effects/absorbKitShield";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const ZHONGLI_KIT = createZhongliKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [ZHONGLI_CHARACTER_ID]));

const createZhongliCombatant = (ascension: number, constellationCount: number): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: ZHONGLI_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: ZHONGLI_KIT,
  level: 90,
});

describe(createZhongliKit, () => {
  const body = { x: 0, z: 0 };
  const kitBody = { facing: 0, height: 0, position: body };
  const holdAction = takeOne(ZHONGLI_KIT.elementalSkillHolds ?? []).action;
  // The summons an action's start casts, as the kit's effects hold them
  const castSummons = (action: KitAction, combatant: Combatant): KitSummon[] => {
    const kitEffectState: KitEffectState = { effects: [] };
    action.onStart?.({ body: kitBody, combatant, kitEffectState });
    return kitEffectState.effects.filter((effect) => effect.kind === "summon");
  };

  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const combatant = createZhongliCombatant(0, 0);
    const multipliers = [
      ...ZHONGLI_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      takeOne(ZHONGLI_KIT.chargedAttack.hits).talentMultiplier,
      ZHONGLI_KIT.plungeCollision.talentMultiplier,
      takeOne(ZHONGLI_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(ZHONGLI_KIT.highPlunge.hits).talentMultiplier,
      ...takeOne(castSummons(ZHONGLI_KIT.elementalSkill, combatant))
        .hits.slice(0, 2)
        .map(({ talentMultiplier }) => talentMultiplier),
      takeOne(holdAction.hits).talentMultiplier,
      takeOne(takeOne(castSummons(ZHONGLI_KIT.elementalBurst, combatant)).hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.3077, 0.3115, 0.3858, 0.4294, 0.1075, 0.1075, 0.1075, 0.1075, 0.545, 1.1103, 0.6393, 1.2784, 1.5968, 0.16, 0.32,
      0.8, 4.0108,
    ];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test.each([
    [0, [0, 0, 0]],
    [4, [139, 190, 3300]],
  ])(
    "at ascension %i, Dominance of Earth adds %j of 10000 Max HP to a strike, a stele and Planet Befall",
    (ascension, bonuses) => {
      expect.hasAssertions();
      const combatant = createZhongliCombatant(ascension, 0);
      const hits = [
        takeOne(takeOne(ZHONGLI_KIT.normalAttacks).hits),
        takeOne(takeOne(castSummons(ZHONGLI_KIT.elementalSkill, combatant)).hits),
        takeOne(takeOne(castSummons(ZHONGLI_KIT.elementalBurst, combatant)).hits),
      ];

      expect(hits.map((hit) => Math.round(hit.additiveBaseDamageBonus?.(combatant) ?? Number.NaN))).toStrictEqual(
        bonuses,
      );
    },
  );

  test.each([
    [0, [1]],
    [1, [3, 1]],
  ])(
    "at %i constellations, three presses a second apart leave the steles cast %j seconds ago, the newest replaced",
    (constellationCount, elapsedSeconds) => {
      expect.hasAssertions();
      const combatant = createZhongliCombatant(0, constellationCount);
      const context = { activeCombatant: combatant, body, party: createParty([ZHONGLI_CHARACTER_ID]) };
      const kitEffectState: KitEffectState = { effects: [] };
      for (let press = 0; press < 3; press++) {
        ZHONGLI_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });
        stepKitEffects(kitEffectState, 1, context);
      }

      expect(
        kitEffectState.effects.flatMap((effect) => (effect.kind === "summon" ? [effect.elapsedSeconds] : [])),
      ).toStrictEqual(elapsedSeconds);
    },
  );

  test("a hold with a stele standing casts none, and its Jade Shield cuts every RES until its health is spent", () => {
    expect.hasAssertions();
    const combatant = createZhongliCombatant(0, 0);
    const context = { activeCombatant: combatant, body, party: createParty([ZHONGLI_CHARACTER_ID]) };
    const kitEffectState: KitEffectState = { effects: [] };
    ZHONGLI_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });
    stepKitEffects(kitEffectState, 1, context);
    holdAction.onStart?.({ body: kitBody, combatant, kitEffectState });
    const cutStrikes = stepKitEffects(kitEffectState, 0.8, context).filter(({ hit }) => hit.enemyStatus);
    const shieldHealth = kitEffectState.effects.find((effect) => effect.kind === "shield")?.health;
    const summonCount = kitEffectState.effects.filter((effect) => effect.kind === "summon").length;
    absorbKitShield(kitEffectState.effects, combatant, Number.POSITIVE_INFINITY);

    expect(summonCount).toBe(2);
    expect(shieldHealth).toBeCloseTo(1232.4108 + 0.128 * 10_000);
    expect(cutStrikes.map(({ hit }) => hit.enemyStatus?.(combatant))).toStrictEqual(
      Array.from({ length: 3 }, () => ({
        damageTakenBonus: 0,
        id: "zhongli-jade-shield",
        physicalResistanceReduction: 0.2,
        resistanceReduction: Object.fromEntries(Elements.map((element) => [element, 0.2])),
        secondsRemaining: 1,
      })),
    );
    expect(stepKitEffects(kitEffectState, 0.5, context)).toStrictEqual([]);
  });

  test.each([
    [0, 7.5, 0],
    [2, 7.5, 1],
    [4, 9, 1],
  ])(
    "at %i constellations, Planet Befall's meteor lands 5 metres ahead at a radius of %d, casting %i Jade Shields",
    (constellationCount, radius, shieldCount) => {
      expect.hasAssertions();
      const combatant = createZhongliCombatant(0, constellationCount);
      const kitEffectState: KitEffectState = { effects: [] };
      ZHONGLI_KIT.elementalBurst.onStart?.({ body: kitBody, combatant, kitEffectState });
      const meteor = takeOne(kitEffectState.effects.filter((effect) => effect.kind === "summon"));

      expect(meteor.body.position).toStrictEqual({ x: 0, z: -5 });
      expect(takeOne(meteor.hits).hitArea.radius).toBe(radius);
      expect(kitEffectState.effects.filter((effect) => effect.kind === "shield")).toHaveLength(shieldCount);
    },
  );
});
