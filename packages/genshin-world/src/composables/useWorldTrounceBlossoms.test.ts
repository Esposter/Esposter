import type { Character } from "#src/models/character/Character";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { useWorldTrounceBlossoms } from "#src/composables/useWorldTrounceBlossoms";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { checkIsEnemyKindId } from "#src/services/enemy/checkIsEnemyKindId";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { createParty } from "#src/services/party/createParty";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";
import { shallowRef } from "vue";

const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(useWorldTrounceBlossoms, () => {
  // A kind only a Spiral Abyss chamber fights is outside the enum, so its traits are its family's defaults, not an entry of
  // The traits map, and its defeat must still reach the listeners after the blossom's
  test("a defeat of a kind outside the enum reaches the listeners after the trounce blossom's", () => {
    expect.hasAssertions();

    const abyssOnlyKind = takeOne([...enemyTables.enemyKindMap.values()].filter(({ id }) => !checkIsEnemyKindId(id)));
    const events = createWorldEvents();
    useWorldTrounceBlossoms({
      adventureExp: shallowRef(0),
      adventureRankTables,
      characters: shallowRef<Character[]>([]),
      completedMainQuestIds: shallowRef(new Set<string>()),
      enemyKindMap: enemyTables.enemyKindMap,
      events,
      gainWorldAdventureExp: () => {},
      gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL,
      gameText: {},
      getGroundHeight: () => 0,
      getWorldNow: () => Temporal.Instant.fromEpochMilliseconds(0),
      inventory: shallowRef(EMPTY_INVENTORY),
      materialDataMap: new Map(),
      nameText: {},
      party: createParty([TRAVELER_CHARACTER_ID]),
      setInventory: () => {},
      setWallet: () => {},
      wallet: shallowRef(EMPTY_WALLET),
    });
    const defeatListener = vi.fn();
    events.on("defeatEnemy", defeatListener);
    const enemy = createEnemy(
      enemyTables,
      [],
      { enemyKindId: abyssOnlyKind.id, id: "1", level: 1, patrol: [], position: { x: 0, z: 0 } },
      "1",
    );
    events.emit("defeatEnemy", enemy);

    expect(defeatListener).toHaveBeenCalledWith(enemy);
  });
});
