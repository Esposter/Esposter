import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELING_DOCTOR_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createTravelingDoctorSetModule } from "#src/services/artifact/sets/createTravelingDoctorSetModule";
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

const createPartyCombatant = (characterId: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
});

describe(createTravelingDoctorSetModule, () => {
  const travelingDoctorSetData = statTables.artifactSetDataMap.get(TRAVELING_DOCTOR_ARTIFACT_SET_ID);
  assert.exists(travelingDoctorSetData);
  const travelingDoctorSetModule = createTravelingDoctorSetModule(takeOne(travelingDoctorSetData.bonuses, 1));
  const PARTY_CHARACTER_IDS = [1, 2];
  const wearer = createPartyCombatant(takeOne(PARTY_CHARACTER_IDS, 0));

  test.each([
    ["its wearer's burst restores 20% of its Max HP", takeOne(PARTY_CHARACTER_IDS, 0), 0.7],
    ["another member's burst restores none", takeOne(PARTY_CHARACTER_IDS, 1), 0.5],
  ])("%s", (_description, characterId, healthShare) => {
    expect.hasAssertions();

    const party = createParty(PARTY_CHARACTER_IDS);
    getPartyMember(party, wearer.characterId).healthShare = 0.5;
    travelingDoctorSetModule.onKitEvent?.(
      { characterId, energyCost: TRAVELER_KIT.burstEnergyCost, kind: KitEventKind.BurstUsed },
      createKitTestContext(wearer, { party }),
      wearer,
    );

    expect(getPartyMember(party, wearer.characterId).healthShare).toStrictEqual(healthShare);
  });
});
