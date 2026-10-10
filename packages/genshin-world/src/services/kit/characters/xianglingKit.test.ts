import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { JEAN_CHARACTER_ID, XIANGLING_CHARACTER_ID } from "#src/services/character/constants";
import { createXianglingKit } from "#src/services/kit/characters/xianglingKit";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const XIANGLING_KIT = createXianglingKit(
  await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [XIANGLING_CHARACTER_ID]),
);

const createXianglingCombatant = (ascension: number, constellationCount: number): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseAttack, value: 200 }]),
  characterId: XIANGLING_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: XIANGLING_KIT,
  level: 90,
});

describe(createXianglingKit, () => {
  const body = { x: 0, z: 0 };
  const kitBody = { facing: 0, height: 0, position: body };

  test("reads each talent multiplier from her proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const combatant = createXianglingCombatant(0, 0);
    const party = createParty([XIANGLING_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    XIANGLING_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });
    XIANGLING_KIT.elementalBurst.onStart?.({ body: kitBody, combatant, kitEffectState });
    // Guoba's first breath lands at 126 frames and the Pyronado's first tick at 56, its next falling at 129
    const summonStrikes = stepKitEffects(kitEffectState, 2.12, { activeCombatant: combatant, body, party });
    const multipliers = [
      ...XIANGLING_KIT.normalAttacks.flatMap((action) => action.hits.map(({ talentMultiplier }) => talentMultiplier)),
      takeOne(XIANGLING_KIT.chargedAttack.hits).talentMultiplier,
      XIANGLING_KIT.plungeCollision.talentMultiplier,
      takeOne(XIANGLING_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(XIANGLING_KIT.highPlunge.hits).talentMultiplier,
      ...summonStrikes.map(({ hit }) => hit.talentMultiplier),
      ...XIANGLING_KIT.elementalBurst.hits.map(({ talentMultiplier }) => talentMultiplier),
    ];
    const expectedMultipliers = [
      0.4205, 0.4214, 0.2606, 0.2606, 0.141, 0.141, 0.141, 0.141, 0.7104, 1.2169, 0.6393, 1.2784, 1.5968, 1.1128, 1.12,
      0.72, 0.88, 1.096,
    ];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test.each([
    [0, 0, 5, undefined],
    [
      1,
      1,
      6,
      {
        damageTakenBonus: 0,
        id: "xiangling-crispy-outside-tender-inside",
        resistanceReduction: { [Element.Pyro]: 0.15 },
        secondsRemaining: 6,
      },
    ],
  ])(
    "at Ascension %i with %i constellations, Guoba breathes four times 1.3 metres ahead, reaching %f metres and giving %j",
    (ascension, constellationCount, radius, status) => {
      expect.hasAssertions();
      const combatant = createXianglingCombatant(ascension, constellationCount);
      const party = createParty([XIANGLING_CHARACTER_ID]);
      const kitEffectState: KitEffectState = { effects: [] };
      XIANGLING_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });
      const breaths = stepKitEffects(kitEffectState, 8, { activeCombatant: combatant, body, party });

      expect(
        breaths.map(({ body: { position }, hit }) => [position, hit.hitArea.radius, hit.enemyStatus?.(combatant)]),
      ).toStrictEqual(Array.from({ length: 4 }, () => [{ x: 0, z: -1.3 }, radius, status]));
      expect(kitEffectState.effects).toStrictEqual([]);
    },
  );

  test.each([
    [0, []],
    [
      4,
      [
        {
          amount: 20,
          attribute: Attribute.Attack,
          characterId: XIANGLING_CHARACTER_ID,
          kind: "buff",
          secondsRemaining: 10,
          source: "Chili Pepper",
        },
      ],
    ],
  ])("at Ascension %i, the body on the field picks up Guoba's chili pepper for %j", (ascension, effects) => {
    expect.hasAssertions();
    const combatant = createXianglingCombatant(ascension, 0);
    const party = createParty([XIANGLING_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    XIANGLING_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });
    // Guoba disappears at 451 frames, 1.3 metres ahead, past the pepper's reach of the body
    stepKitEffects(kitEffectState, 7.6, { activeCombatant: combatant, body, party });
    stepKitEffects(kitEffectState, 1, { activeCombatant: combatant, body: { x: 0, z: -1.3 }, party });

    expect(kitEffectState.effects).toStrictEqual(effects);
  });

  test.each([
    [0, 9],
    [4, 12],
  ])(
    "with %i constellations, the Pyronado lands %i ticks from wherever the body on the field stands",
    (constellationCount, tickCount) => {
      expect.hasAssertions();
      const combatant = createXianglingCombatant(0, constellationCount);
      const party = createParty([XIANGLING_CHARACTER_ID]);
      const kitEffectState: KitEffectState = { effects: [] };
      const movedBody = { x: 3, z: 4 };
      XIANGLING_KIT.elementalBurst.onStart?.({ body: kitBody, combatant, kitEffectState });
      const ticks = stepKitEffects(kitEffectState, 15, { activeCombatant: combatant, body: movedBody, party });

      expect(ticks.map(({ body: { position }, hit }) => [position, hit.element])).toStrictEqual(
        Array.from({ length: tickCount }, () => [movedBody, Element.Pyro]),
      );
      expect(kitEffectState.effects).toStrictEqual([]);
    },
  );

  test.each([
    [0, 0],
    [2, 1],
  ])(
    "with %i constellations, her strikes leave %i Implode explosions 2 seconds past the fifth's hit",
    (constellationCount, explosionCount) => {
      expect.hasAssertions();
      const combatant = createXianglingCombatant(0, constellationCount);
      const party = createParty([XIANGLING_CHARACTER_ID]);
      const kitEffectState: KitEffectState = { effects: [] };
      for (const strike of XIANGLING_KIT.normalAttacks) strike.onStart?.({ body: kitBody, combatant, kitEffectState });
      const explosions = stepKitEffects(kitEffectState, 3, { activeCombatant: combatant, body, party });

      expect(explosions.map(({ hit }) => [hit.element, hit.hitmarkSeconds, hit.talentMultiplier])).toStrictEqual(
        Array.from({ length: explosionCount }, () => [Element.Pyro, (21 + 120) / 60, 0.75]),
      );
    },
  );

  test.each([
    [0, []],
    [
      6,
      [XIANGLING_CHARACTER_ID, JEAN_CHARACTER_ID].map((characterId) => ({
        amount: 0.15,
        attribute: Attribute.PyroDamageBonus,
        characterId,
        kind: "buff",
        secondsRemaining: 14,
        source: "Condensed Pyronado",
      })),
    ],
  ])(
    "with %i constellations, the Pyronado gives each member of the team the Pyro DMG Bonuses %j",
    (constellationCount, buffs) => {
      expect.hasAssertions();
      const combatant = createXianglingCombatant(0, constellationCount);
      const party = createParty([XIANGLING_CHARACTER_ID, JEAN_CHARACTER_ID]);
      const kitEffectState: KitEffectState = { effects: [] };
      XIANGLING_KIT.elementalBurst.onStart?.({ body: kitBody, combatant, kitEffectState });
      stepKitEffects(kitEffectState, 1, { activeCombatant: combatant, body, party });

      expect(kitEffectState.effects.filter(({ kind }) => kind === "buff")).toStrictEqual(buffs);
    },
  );
});
