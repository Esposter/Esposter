import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitCombatant } from "#src/services/kit/createKitCombatant.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyStellarReactionTypes } from "#src/services/party/getPartyStellarReactionTypes";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(getPartyStellarReactionTypes, () => {
  const STELLAR_JUBILEE = {
    stellarReactionTypes: [StellarReactionType.StellarConduct, StellarReactionType.StellarSwirl],
  };

  test("enables each Stellar reaction once however many passives enable it", () => {
    expect.hasAssertions();

    const characterIdCombatantMap = new Map([
      [1, createKitCombatant(1, { ...TRAVELER_KIT, stellarJubilee: STELLAR_JUBILEE })],
      [
        2,
        createKitCombatant(2, {
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
      [1, createKitCombatant(1, TRAVELER_KIT)],
      [2, createKitCombatant(2, TRAVELER_KIT)],
    ]);

    expect(getPartyStellarReactionTypes(characterIdCombatantMap, createParty([1, 2]))).toStrictEqual([]);
  });
});
