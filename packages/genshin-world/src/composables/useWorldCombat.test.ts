import type { Element } from "#src/models/Element";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { useWorldCombat } from "#src/composables/useWorldCombat";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createCharacter } from "#src/services/character/createCharacter";
import { readStatTables } from "#src/services/character/readStatTables";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { REVIVE_HEALTH_SHARE } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { describe, expect, test, vi } from "vitest";
import { shallowRef } from "vue";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(useWorldCombat, () => {
  test("a new player starts with the Traveler alone", () => {
    expect.hasAssertions();
    const { characters } = useWorldCombat({
      characterIdConstellationsMap: shallowRef(new Map()),
      enemyTables,
      events: createWorldEvents(),
      gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL,
      onPartyDown: () => {},
      onPartyRevived: () => {},
      placeWorldDrops: () => {},
      savedCharacters: [],
      savedParty: createParty([TRAVELER_CHARACTER_ID]),
      startingCharacterIdKitMap: new Map([[TRAVELER_CHARACTER_ID, TRAVELER_KIT]]),
      statTables,
      travelerElement: shallowRef<Element>(),
      wildlifePlaces: [],
    });

    expect(characters.value).toStrictEqual([createCharacter(TRAVELER_CHARACTER_ID, statTables.characterDataMap)]);
  });

  test("a chest opened in the world reaches the combat", () => {
    expect.hasAssertions();
    const events = createWorldEvents();
    const { kitContext } = useWorldCombat({
      characterIdConstellationsMap: shallowRef(new Map()),
      enemyTables,
      events,
      gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL,
      onPartyDown: () => {},
      onPartyRevived: () => {},
      placeWorldDrops: () => {},
      savedCharacters: [],
      savedParty: createParty([TRAVELER_CHARACTER_ID]),
      startingCharacterIdKitMap: new Map([[TRAVELER_CHARACTER_ID, TRAVELER_KIT]]),
      statTables,
      travelerElement: shallowRef<Element>(),
      wildlifePlaces: [],
    });
    events.emit("chestOpened");

    expect(kitContext.outbox).toStrictEqual([{ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.ChestOpened }]);
  });

  test("game over offers revive at the nearest waypoint", () => {
    expect.hasAssertions();
    const onPartyDown = vi.fn<() => void>();
    const onPartyRevived = vi.fn<() => void>();
    const { party, respawnParty, reviveFallenParty } = useWorldCombat({
      enemyTables,
      events: createWorldEvents(),
      gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL,
      onPartyDown,
      onPartyRevived,
      placeWorldDrops: () => {},
      savedCharacters: [],
      savedParty: createParty([TRAVELER_CHARACTER_ID]),
      startingCharacterIdKitMap: new Map([[TRAVELER_CHARACTER_ID, TRAVELER_KIT]]),
      statTables,
      travelerElement: shallowRef<Element>(),
      wildlifePlaces: [],
    });
    getPartyMember(party, TRAVELER_CHARACTER_ID).healthShare = 0;
    respawnParty();

    expect(onPartyDown).toHaveBeenCalledTimes(1);
    expect(onPartyRevived).not.toHaveBeenCalled();
    reviveFallenParty();

    expect(onPartyRevived).toHaveBeenCalledTimes(1);
    expect(getPartyMember(party, TRAVELER_CHARACTER_ID).healthShare).toBe(REVIVE_HEALTH_SHARE);
  });
});
