import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { Character } from "#src/models/character/Character";
import type { EnemyKind } from "#src/models/enemy/EnemyKind";
import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";
import type { MaterialData } from "#src/models/inventory/MaterialData";

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
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { readGenshinSave } from "#src/services/save/readGenshinSave";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { computed, ref, shallowRef } from "vue";

const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);

describe(useWorldTrounceBlossoms, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const SPAWN_KEY = "spawn";
  const WORLD_LEVEL = 0;
  const UNIQUE_DROP_ID = 9003;
  const UNIQUE_DROP_NAME_TEXT_ID = "9003";
  const names: Readonly<Record<string, string>> = { [UNIQUE_DROP_NAME_TEXT_ID]: "Test Boss Drop" };
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

  test("a normal boss claim at the Adventure Rank cap pays the boss's EXP overflow once", () => {
    expect.hasAssertions();

    const events = createWorldEvents();
    const wallet = ref({ ...EMPTY_WALLET, [Currency.OriginalResin]: 100 });
    const inventory = ref(EMPTY_INVENTORY);
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
      characters: ref<Character[]>([]),
      enemyKindMap: new Map<number, EnemyKind>(),
      events,
      friendshipLevels: ref<FriendshipLevel[]>([{ exp: 0, level: 1 }]),
      gainWorldAdventureExp: adventureRank.gainWorldAdventureExp,
      gameText: {},
      getGroundHeight: () => 0,
      getWorldNow: () => epoch,
      inventory,
      materialDataMap,
      nameText: names,
      party: savedState.party,
      setInventory: (nextInventory) => {
        inventory.value = nextInventory;
      },
      setWallet: (nextWallet) => {
        wallet.value = nextWallet;
      },
      wallet,
      worldNow: shallowRef(epoch),
    });
    trounceBlossoms.value = new Map<string, TrounceBlossom>([
      [
        SPAWN_KEY,
        { claimedAts: [], kind: BlossomKind.NormalBoss, place: { x: 0, z: 0 }, uniqueDropId: UNIQUE_DROP_ID },
      ],
    ]);
    openTrounceBlossomClaim(SPAWN_KEY, epoch);
    chooseTrounceBlossomClaim(epoch, WORLD_LEVEL, () => 0);

    expect(wallet.value[Currency.Mora]).toBe(
      takeOne(NORMAL_BOSS_MORA, WORLD_LEVEL) + NORMAL_BOSS_ADVENTURE_EXP * MORA_PER_EXCESS_ADVENTURE_EXP,
    );
  });
});
