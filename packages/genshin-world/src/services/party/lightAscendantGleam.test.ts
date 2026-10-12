import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createTravelerKit } from "#src/services/kit/travelerKit";
import { ASCENDANT_GLEAM_SECONDS, ASCENDANT_GLEAM_STATUS_ID } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { lightAscendantGleam } from "#src/services/party/lightAscendantGleam";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

describe(lightAscendantGleam, () => {
  const PARTY_CHARACTER_IDS = [1, 2, 3, 4];
  const MOONSIGN_KIT: Kit = { ...TRAVELER_KIT, moonsignBenediction: { lunarReactionTypes: [] } };
  const createCombatant = (characterId: number, kit: Kit): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId,
    constellationCount: 0,
    elementalResonances: [],
    kit,
    level: 90,
  });
  // The first two members are Moonsign characters, so the deployed team stands at Ascendant Gleam
  const characterIdCombatantMap = new Map(
    PARTY_CHARACTER_IDS.map((characterId, index) => [
      characterId,
      createCombatant(characterId, index < 2 ? MOONSIGN_KIT : TRAVELER_KIT),
    ]),
  );
  const party = createParty(PARTY_CHARACTER_IDS);
  const outsiderCombatant = takeOne([...characterIdCombatantMap.values()], 3);

  test("lights Ascendant Gleam on a character outside the Moonsign for 20 seconds, replacing the one another lit", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = {
      effects: [{ characterId: 3, id: ASCENDANT_GLEAM_STATUS_ID, kind: "status", secondsRemaining: 1 }],
    };
    lightAscendantGleam(kitEffectState, outsiderCombatant, characterIdCombatantMap, party);

    expect(kitEffectState.effects).toStrictEqual([
      { characterId: 4, id: ASCENDANT_GLEAM_STATUS_ID, kind: "status", secondsRemaining: ASCENDANT_GLEAM_SECONDS },
    ]);
  });

  test("lights none from a Moonsign character, nor below Ascendant Gleam", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    lightAscendantGleam(
      kitEffectState,
      takeOne([...characterIdCombatantMap.values()], 0),
      characterIdCombatantMap,
      party,
    );
    lightAscendantGleam(kitEffectState, outsiderCombatant, characterIdCombatantMap, createParty([1, 3, 4]));

    expect(kitEffectState.effects).toStrictEqual([]);
  });
});
