import type { Kit } from "#src/models/kit/Kit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitCombatant } from "#src/services/kit/createKitCombatant.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getMoonsignLevel } from "#src/services/party/getMoonsignLevel";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(getMoonsignLevel, () => {
  const PARTY_CHARACTER_IDS = [1, 2, 3, 4];
  const MOONSIGN_KIT: Kit = { ...TRAVELER_KIT, moonsignBenediction: { lunarReactionTypes: [] } };

  test.each([
    [0, undefined],
    [1, MoonsignLevel.NascentGleam],
    [2, MoonsignLevel.AscendantGleam],
    [3, MoonsignLevel.AscendantGleam],
  ])("rises with %i Moonsign characters in the deployed team to %s", (moonsignCount, level) => {
    expect.hasAssertions();

    const characterIdCombatantMap = new Map(
      PARTY_CHARACTER_IDS.map((characterId, index) => [
        characterId,
        createKitCombatant(characterId, index < moonsignCount ? MOONSIGN_KIT : TRAVELER_KIT),
      ]),
    );

    expect(getMoonsignLevel(characterIdCombatantMap, createParty(PARTY_CHARACTER_IDS))).toBe(level);
  });
});
