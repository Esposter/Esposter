import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { computeTravelerElement } from "#src/services/statue/computeTravelerElement";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const OTHER_CHARACTER_ID = 10_000_999;

const readEnergyRecharge = (combatant: Combatant) => TRAVELER_KIT.getPassiveBonuses?.(combatant, 1, [], []) ?? [];
const readBurstStatus = (combatant: Combatant) => takeOne(TRAVELER_KIT.elementalBurst.hits).enemyStatus?.(combatant);

const createTravelerCombatant = (
  element: Element,
  constellationCount: number,
  characterId = TRAVELER_CHARACTER_ID,
): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId,
  constellationCount,
  element,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 90,
});

describe("travelerKit", () => {
  test("reads each talent multiplier from the Anemo form's table, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...TRAVELER_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...TRAVELER_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      TRAVELER_KIT.plungeCollision.talentMultiplier,
      takeOne(TRAVELER_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(TRAVELER_KIT.highPlunge.hits).talentMultiplier,
      takeOne(TRAVELER_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(TRAVELER_KIT.elementalBurst.hits).talentMultiplier,
    ];
    // oxlint-disable-next-line oxc/approx-constant -- 0.434 is the wiki's talent multiplier, not the LOG10E it approximates
    const expectedMultipliers = [0.445, 0.434, 0.53, 0.583, 0.708, 0.559, 0.722, 0.639, 1.28, 1.6, 1.76, 0.808];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("the Traveler's skill deals the element of the resonated statue", () => {
    expect.hasAssertions();

    const skillHit = takeOne(TRAVELER_KIT.elementalSkill.hits);

    expect(getKitHitElement(skillHit, { element: computeTravelerElement(["liyue"]) })).toBe(Element.Geo);
  });

  test("the Traveler's burst deals the element of the resonated statue", () => {
    expect.hasAssertions();

    const burstHit = takeOne(TRAVELER_KIT.elementalBurst.hits);

    expect(getKitHitElement(burstHit, { element: computeTravelerElement(["liyue"]) })).toBe(Element.Geo);
  });

  test("the Traveler deals no element before any statue is resonated with", () => {
    expect.hasAssertions();

    const skillHit = takeOne(TRAVELER_KIT.elementalSkill.hits);

    expect(getKitHitElement(skillHit, { element: computeTravelerElement([]) })).toBeUndefined();
  });

  test("constellation 2 raises the Energy Recharge of an Anemo Traveler by 16%, and of no other", () => {
    expect.hasAssertions();

    expect([
      readEnergyRecharge(createTravelerCombatant(Element.Anemo, 2)),
      readEnergyRecharge(createTravelerCombatant(Element.Anemo, 1)),
      readEnergyRecharge(createTravelerCombatant(Element.Geo, 2)),
      readEnergyRecharge(createTravelerCombatant(Element.Anemo, 2, OTHER_CHARACTER_ID)),
    ]).toStrictEqual([[{ amount: 0.16, attribute: Attribute.EnergyRecharge }], [], [], []]);
  });

  test("constellation 6 lowers the Anemo RES of an enemy her burst strikes by 20% for 10 seconds, for an Anemo Traveler only", () => {
    expect.hasAssertions();
    const [anemo, belowConstellation6, geo, otherCharacter] = [
      readBurstStatus(createTravelerCombatant(Element.Anemo, 6)),
      readBurstStatus(createTravelerCombatant(Element.Anemo, 5)),
      readBurstStatus(createTravelerCombatant(Element.Geo, 6)),
      readBurstStatus(createTravelerCombatant(Element.Anemo, 6, OTHER_CHARACTER_ID)),
    ];

    expect([anemo?.resistanceReduction, anemo?.secondsRemaining]).toStrictEqual([{ [Element.Anemo]: 0.2 }, 10]);
    expect([belowConstellation6, geo, otherCharacter]).toStrictEqual([undefined, undefined, undefined]);
  });
});
