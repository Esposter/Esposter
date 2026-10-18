import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { Wallet } from "#src/models/inventory/Wallet";

import { useWorldQuestRewards } from "#src/composables/useWorldQuestRewards";
import { Currency } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { QuestKind } from "#src/models/quest/QuestKind";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { describe, expect, test, vi } from "vitest";
import { ref } from "vue";

// A made-up item and quest, since no record is copied into a test. Its rewards are Mora, a made-up item and Adventure EXP
const ITEM_ID = 900_001;
const ADVENTURE_EXP_ITEM_ID = 102;
const MATERIAL_DATA: MaterialData = {
  id: ITEM_ID,
  materialType: MaterialType.Consume,
  nameTextId: "1",
  rank: 1,
  rarity: 1,
  stackLimit: 99,
};
const QUEST: Quest = {
  descriptionTextId: "",
  id: "1",
  kind: QuestKind.World,
  offerTalkIds: [],
  parentQuestIds: [],
  rewards: [
    { count: 2, itemId: 202 },
    { count: 3, itemId: ITEM_ID },
    { count: 40, itemId: ADVENTURE_EXP_ITEM_ID },
  ],
  steps: [],
  talks: [],
  titleTextId: "",
};
const PROGRESS: QuestProgress = { objectiveCounts: [], stepIndex: 0 };

describe(useWorldQuestRewards, () => {
  test("finishing a quest grants its rewards", () => {
    expect.hasAssertions();
    const events = createWorldEvents();
    const inventory = ref<Inventory>({ ...EMPTY_INVENTORY });
    const wallet = ref<Wallet>({ ...EMPTY_WALLET });
    const gainAdventureExp = vi.fn<(amount: number) => void>();
    useWorldQuestRewards({
      events,
      gainAdventureExp,
      inventory,
      materialDataMap: new Map([[ITEM_ID, MATERIAL_DATA]]),
      names: { "1": "Made-up Ore" },
      setInventory: (nextInventory) => {
        inventory.value = nextInventory;
      },
      setWallet: (nextWallet) => {
        wallet.value = nextWallet;
      },
      wallet,
    });
    events.emit("finishQuest", QUEST, PROGRESS, PROGRESS);
    expect(wallet.value[Currency.Mora]).toBe(EMPTY_WALLET[Currency.Mora] + 2);
    expect(inventory.value.items.map(({ definition, quantity }) => ({ id: definition.id, quantity }))).toStrictEqual([
      { id: ITEM_ID, quantity: 3 },
    ]);
    expect(gainAdventureExp).toHaveBeenCalledExactlyOnceWith(40);
  });
});
