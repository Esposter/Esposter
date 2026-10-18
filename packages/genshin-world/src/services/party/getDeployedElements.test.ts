import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { DILUC_CHARACTER_ID } from "#src/services/kit/characters/dilucKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getDeployedElements } from "#src/services/party/getDeployedElements";
import { describe, expect, test } from "vitest";

const DILUC_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, DILUC_CHARACTER_ID);
const createCombatant = (characterId: number, element?: Element): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId,
  constellationCount: 0,
  element,
  elementalResonances: [],
  kit: DILUC_KIT,
  level: 90,
});

describe(getDeployedElements, () => {
  test("reads the deployed members' elements in the team's order, adding none for a member with no element", () => {
    expect.hasAssertions();
    const combatants = new Map([
      [1, createCombatant(1, Element.Pyro)],
      [2, createCombatant(2)],
      [3, createCombatant(3, Element.Cryo)],
    ]);
    expect(getDeployedElements(createParty([1, 2, 3]), combatants)).toStrictEqual([Element.Pyro, Element.Cryo]);
  });

  test("reads nothing for a character outside the party", () => {
    expect.hasAssertions();
    expect(getDeployedElements(createParty([1]), new Map([[2, createCombatant(2, Element.Hydro)]]))).toStrictEqual([]);
  });
});
