import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createTravelerKit } from "#src/services/kit/travelerKit";
import { getAscendantGleamBonus } from "#src/services/party/getAscendantGleamBonus";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

const createCombatant = (element: Element, attributeLines: AttributeLine[]): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes(attributeLines),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  element,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 90,
});

describe(getAscendantGleamBonus, () => {
  test.each([
    [Element.Electro, Attribute.Attack, 2000],
    [Element.Pyro, Attribute.Attack, 2000],
    [Element.Cryo, Attribute.Attack, 2000],
    [Element.Hydro, Attribute.Health, 30_000],
    [Element.Dendro, Attribute.ElementalMastery, 800],
    [Element.Anemo, Attribute.ElementalMastery, 800],
    [Element.Geo, Attribute.Defense, 1800],
  ])("gives 18%% from a %s character with %s at %i", (element, attribute, value) => {
    expect.hasAssertions();

    expect(getAscendantGleamBonus(createCombatant(element, [{ attribute, value }]))).toBeCloseTo(0.18);
  });

  test("gives at most 36%", () => {
    expect.hasAssertions();

    expect(
      getAscendantGleamBonus(createCombatant(Element.Electro, [{ attribute: Attribute.Attack, value: 5000 }])),
    ).toBe(0.36);
  });
});
