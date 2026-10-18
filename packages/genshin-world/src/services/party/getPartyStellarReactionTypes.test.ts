import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyStellarReactionTypes } from "#src/services/party/getPartyStellarReactionTypes";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const STELLAR_JUBILEE = {
  stellarReactionTypes: [StellarReactionType.StellarConduct, StellarReactionType.StellarSwirl],
};

const createCombatant = (characterId: number, kit: Kit): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId,
  constellationCount: 0,
  elementalResonances: [],
  kit,
  level: 90,
});

describe(getPartyStellarReactionTypes, () => {
  test("enables each Stellar reaction once however many passives enable it", () => {
    expect.hasAssertions();

    const characterIdCombatantMap = new Map([
      [1, createCombatant(1, { ...TRAVELER_KIT, stellarJubilee: STELLAR_JUBILEE })],
      [
        2,
        createCombatant(2, {
          ...TRAVELER_KIT,
          stellarJubilee: { stellarReactionTypes: [StellarReactionType.StellarConduct] },
        }),
      ],
    ]);

    expect(getPartyStellarReactionTypes(characterIdCombatantMap, createParty([1, 2]))).toStrictEqual([
      StellarReactionType.StellarConduct,
      StellarReactionType.StellarSwirl,
    ]);
  });

  test("enables nothing for a party with no Stellar Jubilee passive", () => {
    expect.hasAssertions();

    const characterIdCombatantMap = new Map([
      [1, createCombatant(1, TRAVELER_KIT)],
      [2, createCombatant(2, TRAVELER_KIT)],
    ]);

    expect(getPartyStellarReactionTypes(characterIdCombatantMap, createParty([1, 2]))).toStrictEqual([]);
  });
});
