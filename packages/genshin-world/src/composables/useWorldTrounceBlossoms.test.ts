import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { Character } from "#src/models/character/Character";
import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { useWorldAdventureRank } from "#src/composables/useWorldAdventureRank";
import { useWorldTrounceBlossoms } from "#src/composables/useWorldTrounceBlossoms";
import { Currency } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { computeAdventureExpAtRank } from "#src/services/adventureRank/computeAdventureExpAtRank";
import { MAX_ADVENTURE_RANK, MORA_PER_EXCESS_ADVENTURE_EXP } from "#src/services/adventureRank/constants";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { NORMAL_BOSS_ADVENTURE_EXP, NORMAL_BOSS_MORA } from "#src/services/bosses/constants";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { checkIsEnemyKindId } from "#src/services/enemy/checkIsEnemyKindId";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { BlossomClaimResinMap } from "#src/services/originalResin/BlossomClaimResinMap";
import { createParty } from "#src/services/party/createParty";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { readGenshinSave } from "#src/services/save/readGenshinSave";
import { flushReads } from "#src/services/shared/flushReads.test";
import { createWorldClock } from "#src/services/time/createWorldClock.test";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { takeOne } from "@esposter/shared";
import { InteractionKind } from "genshin-interface";
import { describe, expect, test, vi } from "vitest";
import { computed, ref, shallowRef } from "vue";

const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const SPAWN_KEY = "spawn";
const UNIQUE_DROP_ID = 9003;
const UNIQUE_DROP_NAME_TEXT_ID = "9003";
// The epoch is a Thursday on the server's clock, so four days on at eight in the morning is the Monday after that week's reset
const epoch = Temporal.Instant.fromEpochMilliseconds(0);
const nextWeek = epoch.add({ hours: 4 * 24 });
const materialDataMap = new Map<number, MaterialData>([
  [
    UNIQUE_DROP_ID,
    {
      id: UNIQUE_DROP_ID,
      materialType: MaterialType.Exchange,
      nameTextId: UNIQUE_DROP_NAME_TEXT_ID,
      rank: 0,
      rarity: 0,
      stackLimit: 99,
    },
  ],
]);
const savedState = readGenshinSave(EMPTY_GENSHIN_SAVE, {}, new Map(), new Map(), new Map());
const maxAdventureExp = computeAdventureExpAtRank(adventureRankTables.levels, MAX_ADVENTURE_RANK);
const ascensionQuestIds = new Set([25_001, 25_005, 25_009, 25_011]);

describe(useWorldTrounceBlossoms, () => {
  // A kind only a Spiral Abyss chamber fights is outside the enum, so its traits are its family's defaults, not an entry of
  // The traits map, and its defeat must still reach the listeners after the blossom's
  test("a defeat of a kind outside the enum reaches the listeners after the trounce blossom's", () => {
    expect.hasAssertions();

    const abyssOnlyKind = takeOne([...enemyTables.enemyKindMap.values()].filter(({ id }) => !checkIsEnemyKindId(id)));
    const events = createWorldEvents();
    useWorldTrounceBlossoms({
      characters: shallowRef<Character[]>([]),
      enemyKindMap: enemyTables.enemyKindMap,
      events,
      friendshipLevels: shallowRef<FriendshipLevel[]>([]),
      gainWorldAdventureExp: () => {},
      gameText: {},
      getGroundHeight: () => 0,
      getWorldNow: () => epoch,
      inventory: shallowRef(EMPTY_INVENTORY),
      materialDataMap: new Map(),
      nameText: {},
      party: createParty([TRAVELER_CHARACTER_ID]),
      setInventory: () => {},
      setWallet: () => {},
      wallet: shallowRef(EMPTY_WALLET),
      worldNow: shallowRef(epoch),
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

  test("a weekly boss's Trounce Blossom is offered again once the weekly reset passes, with no write", () => {
    expect.hasAssertions();
    const clock = createWorldClock(epoch.add({ hours: 1 }));
    const { trounceBlossomInteractables, trounceBlossoms } = useWorldTrounceBlossoms({
      characters: ref([]),
      enemyKindMap: new Map(),
      events: createWorldEvents(),
      friendshipLevels: ref<FriendshipLevel[]>([]),
      gainWorldAdventureExp: vi.fn(),
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

  test("a normal boss's claim pays its Adventure EXP once, the resin's own EXP not written back", async () => {
    expect.hasAssertions();
    const adventureExp = ref(0);
    const { chooseTrounceBlossomClaim, openTrounceBlossomClaim, trounceBlossoms } = useWorldTrounceBlossoms({
      characters: ref([]),
      enemyKindMap: new Map(),
      events: createWorldEvents(),
      friendshipLevels: ref<FriendshipLevel[]>([{ exp: 0, level: 1 }]),
      gainWorldAdventureExp: (amount) => {
        adventureExp.value += amount;
      },
      gameText: {},
      getGroundHeight: () => 0,
      getWorldNow: () => epoch,
      inventory: ref<Inventory>(EMPTY_INVENTORY),
      materialDataMap,
      nameText: { [UNIQUE_DROP_NAME_TEXT_ID]: "Test Boss Drop" },
      party: createParty([TRAVELER_CHARACTER_ID]),
      setInventory: vi.fn(),
      setWallet: vi.fn(),
      wallet: ref<Wallet>({ ...EMPTY_WALLET, [Currency.OriginalResin]: BlossomClaimResinMap[BlossomKind.NormalBoss] }),
      worldNow: ref(epoch),
    });
    trounceBlossoms.value = new Map<string, TrounceBlossom>([
      [
        SPAWN_KEY,
        { claimedAts: [], kind: BlossomKind.NormalBoss, place: { x: 1, z: 2 }, uniqueDropId: UNIQUE_DROP_ID },
      ],
    ]);
    await flushReads();

    openTrounceBlossomClaim(SPAWN_KEY, epoch);
    chooseTrounceBlossomClaim(epoch, 0, () => 0);

    expect(adventureExp.value).toStrictEqual(NORMAL_BOSS_ADVENTURE_EXP);
  });

  test("a normal boss claim at the Adventure Rank cap pays the boss's EXP overflow once", () => {
    expect.hasAssertions();

    const events = createWorldEvents();
    const wallet = ref<Wallet>({
      ...EMPTY_WALLET,
      [Currency.OriginalResin]: BlossomClaimResinMap[BlossomKind.NormalBoss],
    });
    const adventureRank = useWorldAdventureRank({
      adventureRankTables,
      events,
      finishedMainQuestIds: computed(() => ascensionQuestIds),
      getWorldNow: () => epoch,
      savedAdventureExp: maxAdventureExp,
      savedAdventureRankRewardsClaimed: [],
      savedWorldLevelAdjustment: savedState.worldLevelAdjustment,
      setWallet: (nextWallet) => {
        wallet.value = nextWallet;
      },
      wallet,
    });
    const { chooseTrounceBlossomClaim, openTrounceBlossomClaim, trounceBlossoms } = useWorldTrounceBlossoms({
      characters: ref([]),
      enemyKindMap: new Map(),
      events,
      friendshipLevels: ref<FriendshipLevel[]>([{ exp: 0, level: 1 }]),
      gainWorldAdventureExp: adventureRank.gainWorldAdventureExp,
      gameText: {},
      getGroundHeight: () => 0,
      getWorldNow: () => epoch,
      inventory: ref<Inventory>(EMPTY_INVENTORY),
      materialDataMap,
      nameText: { [UNIQUE_DROP_NAME_TEXT_ID]: "Test Boss Drop" },
      party: createParty([TRAVELER_CHARACTER_ID]),
      setInventory: vi.fn(),
      setWallet: (nextWallet) => {
        wallet.value = nextWallet;
      },
      wallet,
      worldNow: ref(epoch),
    });
    trounceBlossoms.value = new Map<string, TrounceBlossom>([
      [
        SPAWN_KEY,
        { claimedAts: [], kind: BlossomKind.NormalBoss, place: { x: 1, z: 2 }, uniqueDropId: UNIQUE_DROP_ID },
      ],
    ]);
    openTrounceBlossomClaim(SPAWN_KEY, epoch);
    chooseTrounceBlossomClaim(epoch, 0, () => 0);

    expect(wallet.value[Currency.Mora]).toBe(
      takeOne(NORMAL_BOSS_MORA, 0) + NORMAL_BOSS_ADVENTURE_EXP * MORA_PER_EXCESS_ADVENTURE_EXP,
    );
  });
});
