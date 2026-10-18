import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { DILUC_CHARACTER_ID } from "#src/services/kit/characters/dilucKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getDeployedCombatants } from "#src/services/party/getDeployedCombatants";
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

describe(getDeployedCombatants, () => {
  test("reads the deployed members' combatants in the team's order, leaving out a member with no combatant", () => {
    expect.hasAssertions();
    const pyro = createCombatant(1, Element.Pyro);
    const cryo = createCombatant(3, Element.Cryo);
    const combatants = new Map([
      [1, pyro],
      [3, cryo],
    ]);
    expect(getDeployedCombatants(createParty([1, 2, 3]), combatants)).toStrictEqual([
      { ...pyro, isOnField: true },
      { ...cryo, isOnField: false },
    ]);
  });

  test("flags only the member at the active index as on the field", () => {
    expect.hasAssertions();
    const pyro = createCombatant(1, Element.Pyro);
    const cryo = createCombatant(3, Element.Cryo);
    const party = createParty([1, 3]);
    party.activeIndex = 1;
    expect(
      getDeployedCombatants(
        party,
        new Map([
          [1, pyro],
          [3, cryo],
        ]),
      ),
    ).toStrictEqual([
      { ...pyro, isOnField: false },
      { ...cryo, isOnField: true },
    ]);
  });

  test("reads nothing for a character outside the party", () => {
    expect.hasAssertions();
    expect(getDeployedCombatants(createParty([1]), new Map([[2, createCombatant(2, Element.Hydro)]]))).toStrictEqual(
      [],
    );
  });
});
