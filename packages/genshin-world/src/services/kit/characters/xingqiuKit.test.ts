import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createXingqiuKitBehaviour, XINGQIU_CHARACTER_ID } from "#src/services/kit/characters/xingqiuKit";
import { KIT_FRAMES_PER_SECOND } from "#src/services/kit/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const XINGQIU_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, XINGQIU_CHARACTER_ID);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
// A normal attack of the character on the field starts, its first strike of a string or a later one
const startNormalAttack = (action: KitAction, isFirstStrike: boolean, context: KitContext, combatant: Combatant) =>
  XINGQIU_KIT.onKitEvent?.({ action, isFirstStrike, kind: KitEventKind.NormalAttackStarted }, context, combatant);
// The strikes the team's effects land over the given frames, each frame stepped on its own, so a tick lands on its frame
const stepKitFrames = (frames: number, context: KitContext): KitStrike[] =>
  Array.from({ length: frames }, () => stepKitTestEffects(1 / KIT_FRAMES_PER_SECOND, context)).flat();
const createXingqiuCombatant = (ascension: number, constellationCount: number): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseAttack, value: 200 },
    { attribute: Attribute.BaseHealth, value: 10_000 },
  ]),
  characterId: XINGQIU_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: XINGQIU_KIT,
  level: 90,
});

// The Traveler, standing on the field while Xingqiu's effects run
const createTravelerCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 90,
});

describe(createXingqiuKitBehaviour, () => {
  const body = { x: 0, z: 0 };

  test("reads each talent multiplier from his proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const combatant = createXingqiuCombatant(0, 0);
    const skillContext = createKitTestContext(combatant);
    XINGQIU_KIT.elementalSkill.onStart?.(skillContext);
    // Fatal Rainscreen's hits land at 12 and 31 frames, ahead of the Rain Swords' first Hydro at 44
    const rainscreenStrikes = stepKitTestEffects(0.6, skillContext);
    const burstContext = createKitTestContext(combatant);
    XINGQIU_KIT.elementalBurst.onStart?.(burstContext);
    startNormalAttack(takeOne(XINGQIU_KIT.normalAttacks), true, burstContext, combatant);
    // The Rain Swords' first Hydro lands at 19 frames, and the first wave's two swords at 27, its cast 7 frames on from
    // The first strike's start and its swords 20 frames after
    const swordStrikes = stepKitFrames(40, burstContext).filter(({ hit }) => hit.talentMultiplier > 0);
    const multipliers = [
      ...XINGQIU_KIT.normalAttacks.flatMap((action) => action.hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...XINGQIU_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      XINGQIU_KIT.plungeCollision.talentMultiplier,
      takeOne(XINGQIU_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(XINGQIU_KIT.highPlunge.hits).talentMultiplier,
      ...rainscreenStrikes.map(({ hit }) => hit.talentMultiplier),
      ...swordStrikes.map(({ hit }) => hit.talentMultiplier),
    ];
    const expectedMultipliers = [
      0.4661, 0.4764, 0.2855, 0.2855, 0.5599, 0.3586, 0.3586, 0.473, 0.5616, 0.6393, 1.2784, 1.5968, 1.68, 1.912,
      0.5427, 0.5427,
    ];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("Raincutter's wave is cast 7 frames on from the first normal attack of a string starts, its swords 20 frames after", () => {
    expect.hasAssertions();
    const combatant = createXingqiuCombatant(0, 0);
    const travelerCombatant = createTravelerCombatant();
    const party = createParty([XINGQIU_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(travelerCombatant, { kitEffectState, party });
    XINGQIU_KIT.elementalBurst.onStart?.(createKitTestContext(combatant, { kitEffectState, party }));
    startNormalAttack(takeOne(TRAVELER_KIT.normalAttacks), true, context, combatant);
    // The Rain Swords' Hydro ticks carry no talent multiplier, so only a wave's swords count
    const swordsBeforeLanding = stepKitFrames(24, context).filter(({ hit }) => hit.talentMultiplier > 0);
    const swordsAtLanding = stepKitFrames(6, context).filter(({ hit }) => hit.talentMultiplier > 0);

    expect(swordsBeforeLanding).toStrictEqual([]);
    expect(swordsAtLanding).toHaveLength(2);
  });

  test("Raincutter's wave is cast as a later normal attack of a string starts, its swords 20 frames after", () => {
    expect.hasAssertions();
    const combatant = createXingqiuCombatant(0, 0);
    const travelerCombatant = createTravelerCombatant();
    const party = createParty([XINGQIU_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(travelerCombatant, { kitEffectState, party });
    XINGQIU_KIT.elementalBurst.onStart?.(createKitTestContext(combatant, { kitEffectState, party }));
    startNormalAttack(takeOne(TRAVELER_KIT.normalAttacks), false, context, combatant);
    const swords = stepKitFrames(24, context).filter(({ hit }) => hit.talentMultiplier > 0);

    expect(swords).toHaveLength(2);
  });

  test("the skill's Rain Swords put Hydro of no damage round the body on the field every 2.25 seconds for 15", () => {
    expect.hasAssertions();
    const combatant = createXingqiuCombatant(0, 0);
    const kitEffectState: KitEffectState = { effects: [] };
    const movedBody = { x: 3, z: 4 };
    XINGQIU_KIT.elementalSkill.onStart?.(createKitTestContext(combatant, { kitEffectState }));
    const strikes = stepKitTestEffects(
      15,
      createKitTestContext(combatant, { body: { facing: 0, height: 0, position: movedBody }, kitEffectState }),
    );

    expect(strikes.map(({ body: { position }, hit }) => [position, hit.element, hit.talentMultiplier])).toStrictEqual([
      [body, Element.Hydro, 1.68],
      [body, Element.Hydro, 1.912],
      ...Array.from({ length: 7 }, () => [movedBody, Element.Hydro, 0]),
    ]);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test.each([
    [0, [2, 3, 2], undefined, 0],
    [
      6,
      [2, 3, 5],
      {
        damageTakenBonus: 0,
        id: "xingqiu-rainbow-upon-the-azure-sky",
        resistanceReduction: { [Element.Hydro]: 0.15 },
        secondsRemaining: 4,
      },
      3,
    ],
  ])(
    "with %i constellations, Raincutter's waves of %j swords follow the field's normal attacks once a second",
    (constellationCount, swordCounts, status, energy) => {
      expect.hasAssertions();
      const combatant = createXingqiuCombatant(0, constellationCount);
      const travelerCombatant = createTravelerCombatant();
      const party = createParty([XINGQIU_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
      const kitEffectState: KitEffectState = { effects: [] };
      const context = createKitTestContext(travelerCombatant, { kitEffectState, party });
      const normalAttack = takeOne(TRAVELER_KIT.normalAttacks);
      XINGQIU_KIT.elementalBurst.onStart?.(createKitTestContext(combatant, { kitEffectState, party }));
      const waves = Array.from({ length: swordCounts.length }, () => {
        startNormalAttack(normalAttack, false, context, combatant);
        const strikes = stepKitTestEffects(0.5, context);
        // A normal attack within the second of the last wave sets none off
        startNormalAttack(normalAttack, false, context, combatant);
        return [...strikes, ...stepKitTestEffects(0.5, context)].filter(({ hit }) => hit.talentMultiplier > 0);
      });
      // Raincutter ends, so a normal attack after it sets no wave off
      stepKitEffects(20, context);
      startNormalAttack(normalAttack, false, context, combatant);

      expect(waves.map((wave) => wave.length)).toStrictEqual(swordCounts);
      expect(takeOne(takeOne(waves)).hit.enemyStatus?.(combatant)).toStrictEqual(status);
      expect(getPartyMember(party, XINGQIU_CHARACTER_ID).energy).toBe(energy);
      expect(kitEffectState.effects).toStrictEqual([]);
    },
  );

  test.each([
    [0, 1.68, 1.912],
    [4, 2.52, 2.868],
  ])(
    "with %i constellations, Fatal Rainscreen cast in Raincutter deals %f and %f",
    (constellationCount, first, second) => {
      expect.hasAssertions();
      const context = createKitTestContext(createXingqiuCombatant(0, constellationCount));
      XINGQIU_KIT.elementalBurst.onStart?.(context);
      XINGQIU_KIT.elementalSkill.onStart?.(context);
      const strikes = stepKitTestEffects(0.6, context);

      expect(
        strikes.map(({ hit }) => hit.talentMultiplier).filter((talentMultiplier) => talentMultiplier > 0),
      ).toStrictEqual([expect.closeTo(first, 10), expect.closeTo(second, 10)]);
    },
  );

  test.each([
    [0, 0, 0.5],
    [1, 0, 0.68],
    [1, 1, 0.74],
  ])(
    "at Ascension %i with %i constellations, the Rain Swords' end, which the burst moves on, leaves the field's HP at %f",
    (ascension, constellationCount, healthShare) => {
      expect.hasAssertions();
      const combatant = createXingqiuCombatant(ascension, constellationCount);
      const party = createParty([TRAVELER_CHARACTER_ID, XINGQIU_CHARACTER_ID]);
      const kitEffectState: KitEffectState = { effects: [] };
      const context = createKitTestContext(createTravelerCombatant(), { kitEffectState, party });
      const xingqiuContext = createKitTestContext(combatant, { kitEffectState, party });
      getPartyMember(party, TRAVELER_CHARACTER_ID).healthShare = 0.5;
      XINGQIU_KIT.elementalSkill.onStart?.(xingqiuContext);
      stepKitEffects(10, context);
      XINGQIU_KIT.elementalBurst.onStart?.(xingqiuContext);
      // The skill's Rain Swords would end at 15 seconds, and the burst at 10 stands them until 25
      stepKitEffects(5.5, context);
      const lengthenedHealthShare = getPartyMember(party, TRAVELER_CHARACTER_ID).healthShare;
      stepKitEffects(11, context);

      expect(lengthenedHealthShare).toBe(0.5);
      expect(getPartyMember(party, TRAVELER_CHARACTER_ID).healthShare).toBeCloseTo(healthShare, 10);
      expect(kitEffectState.effects).toStrictEqual([]);
    },
  );

  test.each([
    [0, []],
    [4, [{ amount: 0.2, attribute: Attribute.HydroDamageBonus }]],
  ])("at Ascension %i, Blades Amidst Raindrops adds %j to his pricing", (ascension, bonuses) => {
    expect.hasAssertions();

    expect(XINGQIU_KIT.getPassiveBonuses?.(createXingqiuCombatant(ascension, 0), 1, [], [])).toStrictEqual(bonuses);
  });
});
