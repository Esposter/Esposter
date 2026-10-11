import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { LUCKY_DOG_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createLuckyDogSetModule } from "#src/services/artifact/sets/createLuckyDogSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createLuckyDogSetModule, () => {
  const luckyDogSetData = statTables.artifactSetDataMap.get(LUCKY_DOG_ARTIFACT_SET_ID);
  assert.exists(luckyDogSetData);
  const luckyDogSetModule = createLuckyDogSetModule(takeOne(luckyDogSetData.bonuses, 1));
  const PARTY_CHARACTER_IDS = [1, 2];
  const wearer: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 3000 }]),
    characterId: takeOne(PARTY_CHARACTER_IDS, 0),
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };

  test.each([
    ["Mora its wearer picks up restores 300 HP", takeOne(PARTY_CHARACTER_IDS, 0), 0.6],
    ["Mora another member picks up restores none", takeOne(PARTY_CHARACTER_IDS, 1), 0.5],
  ])("%s", (_description, characterId, healthShare) => {
    expect.hasAssertions();

    const party = createParty(PARTY_CHARACTER_IDS);
    getPartyMember(party, wearer.characterId).healthShare = 0.5;
    luckyDogSetModule.onKitEvent?.(
      { characterId, kind: KitEventKind.MoraPickedUp },
      createKitTestContext(wearer, { party }),
      wearer,
    );

    expect(getPartyMember(party, wearer.characterId).healthShare).toBeCloseTo(healthShare);
  });
});
