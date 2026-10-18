import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { useWorldCombat } from "#src/composables/useWorldCombat";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createCharacter } from "#src/services/character/createCharacter";
import { readStatTables } from "#src/services/character/readStatTables";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(useWorldCombat, () => {
  test("a new player starts with the Traveler alone", () => {
    expect.hasAssertions();
    const { characters } = useWorldCombat({
      enemyTables,
      events: createWorldEvents(),
      gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL,
      onPartyRevived: () => {},
      placeWorldDrops: () => {},
      savedCharacters: [],
      startingCharacterIdKitMap: new Map([[TRAVELER_CHARACTER_ID, TRAVELER_KIT]]),
      statTables,
    });

    expect(characters.value).toStrictEqual([createCharacter(TRAVELER_CHARACTER_ID, statTables.characterDataMap)]);
  });
});
