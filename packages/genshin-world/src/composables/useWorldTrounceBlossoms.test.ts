import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { Inventory } from "#src/models/inventory/Inventory";

import { useWorldTrounceBlossoms } from "#src/composables/useWorldTrounceBlossoms";
import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readFriendshipLevels } from "#src/services/friendship/readFriendshipLevels";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { createParty } from "#src/services/party/createParty";
import { createWorldClock } from "#src/services/time/createWorldClock.test";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { InteractionKind } from "genshin-interface";
import { describe, expect, test, vi } from "vitest";
import { ref, shallowRef } from "vue";

vi.mock(import("#src/services/friendship/readFriendshipLevels"));

const SPAWN_KEY = "spawn";
// The epoch is a Thursday on the server's clock, so four days on at eight in the morning is the Monday after that week's reset
const epoch = Temporal.Instant.fromEpochMilliseconds(0);
const nextWeek = epoch.add({ hours: 4 * 24 });

describe(useWorldTrounceBlossoms, () => {
  test("a weekly boss's Trounce Blossom is offered again once the weekly reset passes, with no write", () => {
    expect.hasAssertions();
    vi.mocked(readFriendshipLevels).mockResolvedValue([]);
    const clock = createWorldClock(epoch.add({ hours: 1 }));
    const { trounceBlossomInteractables, trounceBlossoms } = useWorldTrounceBlossoms({
      adventureExp: ref(0),
      adventureRankTables: {} as AdventureRankTables,
      characters: ref([]),
      completedMainQuestIds: shallowRef(new Set<string>()),
      enemyKindMap: new Map(),
      events: createWorldEvents(),
      gainWorldAdventureExp: vi.fn(),
      gameDataBaseUrl: "",
      gameText: {},
      getGroundHeight: () => 0,
      getWorldNow: clock.getWorldNow,
      inventory: ref<Inventory>(EMPTY_INVENTORY),
      materialDataMap: new Map(),
      nameText: {},
      party: createParty([TRAVELER_CHARACTER_ID]),
      setInventory: vi.fn(),
      setWallet: vi.fn(),
      wallet: ref(EMPTY_WALLET),
      worldNow: clock.worldNow,
    });
    trounceBlossoms.value = new Map<string, TrounceBlossom>([
      [SPAWN_KEY, { claimedAts: [epoch], kind: BlossomKind.WeeklyBoss, place: { x: 1, z: 2 } }],
    ]);
    expect(trounceBlossomInteractables.value).toStrictEqual([]);

    clock.moveTo(nextWeek);

    expect(trounceBlossomInteractables.value).toStrictEqual([
      { id: SPAWN_KEY, kind: InteractionKind.Claim, name: "", position: { x: 1, y: 0, z: 2 } },
    ]);
  });
});
