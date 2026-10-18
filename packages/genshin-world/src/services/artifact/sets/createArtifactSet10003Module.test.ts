import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { ARTIFACT_SET_10003_ID } from "#src/services/artifact/constants";
import { createArtifactSet10003Module } from "#src/services/artifact/sets/createArtifactSet10003Module";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { assert, describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const createCombatant = (deployedElements?: (Element | undefined)[]): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  deployedElements,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
});

describe(createArtifactSet10003Module, () => {
  const bonus = statTables.artifactSetDataMap.get(ARTIFACT_SET_10003_ID)?.bonuses.find((b) => b.pieceCount === 4);
  assert.exists(bonus);
  const module = createArtifactSet10003Module(bonus);

  test("prices its wearer at 30% more Elemental RES to each different element its party holds", () => {
    expect.hasAssertions();

    expect(
      module.getPassiveBonuses?.(createCombatant([Element.Hydro, Element.Hydro, Element.Pyro]), 1, [], []),
    ).toStrictEqual([
      { amount: 0.3, attribute: Attribute.HydroResistance },
      { amount: 0.3, attribute: Attribute.PyroResistance },
    ]);
  });

  test("prices nothing for a wearer whose team holds no element", () => {
    expect.hasAssertions();

    expect(module.getPassiveBonuses?.(createCombatant([undefined]), 1, [], [])).toStrictEqual([]);
  });
});
