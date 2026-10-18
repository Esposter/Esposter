import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { BERSERKER_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createBerserkerSetModule } from "#src/services/artifact/sets/createBerserkerSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createBerserkerSetModule, () => {
  const berserkerSetData = statTables.artifactSetDataMap.get(BERSERKER_ARTIFACT_SET_ID);
  assert.exists(berserkerSetData);
  const berserkerSetModule = createBerserkerSetModule(takeOne(berserkerSetData.bonuses, 1));
  const wearer: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };

  test.each([
    ["24% more CRIT Rate below 70% of its Max HP", 0.69, [{ amount: 0.24, attribute: Attribute.CriticalRate }]],
    ["nothing more at 70% of its Max HP", 0.7, []],
  ])("prices its wearer's hits with %s", (_description, healthShare, bonuses) => {
    expect.hasAssertions();

    expect(berserkerSetModule.getPassiveBonuses?.(wearer, healthShare, [], [])).toStrictEqual(bonuses);
  });
});
