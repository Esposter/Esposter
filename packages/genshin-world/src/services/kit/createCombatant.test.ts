import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createCharacter } from "#src/services/character/createCharacter";
import { getCharacterAttributeLines } from "#src/services/character/getCharacterAttributeLines";
import { readStatTables } from "#src/services/character/readStatTables";
import { AMBER_CHARACTER_ID } from "#src/services/kit/characters/amberKit";
import { createCombatant } from "#src/services/kit/createCombatant";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createCombatant, () => {
  test("carries the element and the kind of weapon its row of the roster gives it", () => {
    expect.hasAssertions();

    const character = createCharacter(AMBER_CHARACTER_ID, statTables.characterDataMap);

    expect(createCombatant(character, TRAVELER_KIT, [], statTables)).toStrictEqual({
      ascension: 0,
      attributes: computeCharacterAttributes(getCharacterAttributeLines(character, statTables), []),
      characterId: AMBER_CHARACTER_ID,
      constellationCount: 0,
      element: Element.Pyro,
      elementalResonances: [],
      kit: TRAVELER_KIT,
      level: 1,
      regionId: "mondstadt",
      weaponType: WeaponType.Bow,
    });
  });

  test("the Traveler carries the element of the resonated statue", () => {
    expect.hasAssertions();

    const character = createCharacter(TRAVELER_CHARACTER_ID, statTables.characterDataMap);

    expect(createCombatant(character, TRAVELER_KIT, [], statTables, Element.Geo).element).toBe(Element.Geo);
  });
});
