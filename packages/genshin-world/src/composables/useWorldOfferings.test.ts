import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";
import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { FrostbearingTreePlace } from "#src/models/offering/FrostbearingTreePlace";
import type { OfferingProgressSave } from "#src/models/offering/OfferingProgressSave";

import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { useWorldOfferings } from "#src/composables/useWorldOfferings";
import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { readMaterialDataMap } from "#src/services/inventory/readMaterialDataMap";
import { FROSTBEARING_TREE_OFFERING_ID } from "#src/services/offering/constants";
import { offerBagItems } from "#src/services/offering/offerBagItems";
import { readFrostbearingTreeLevels } from "#src/services/offering/readFrostbearingTreeLevels";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { assert, describe, expect, test } from "vitest";
import { ref, shallowRef } from "vue";

const materialDataMap = await readMaterialDataMap(GAME_DATA_LOCAL_BASE_URL);
const levels = await readFrostbearingTreeLevels(GAME_DATA_LOCAL_BASE_URL);

describe(useWorldOfferings, () => {
  test("offers the bag as it stands once the tree's levels arrive, gains the levels' Adventure EXP and drops what the bag has no room for at the tree", async () => {
    expect.hasAssertions();

    const offeringLevel = levels.find(({ items }) => items.length > 0);
    assert.exists(offeringLevel);
    const offeringItem = offeringLevel.items[0];
    assert.exists(offeringItem);
    const definition = getItemDefinition(offeringItem.itemId, englishNameText, materialDataMap);
    const inventory = ref<Inventory>({ items: [], nextId: 0, quickSwapItemIds: [] });
    const wallet = ref(EMPTY_WALLET);
    const frostbearingTreeProgress = shallowRef<OfferingProgressSave>({ heldCounts: {}, level: 1 });
    const gainedAdventureExps: number[] = [];
    const frostbearingTreePlace: FrostbearingTreePlace = { id: "tree", position: { x: 1, z: 2 } };
    const placedDrops: [FrostbearingTreePlace, DroppedItem[]][] = [];
    const events = createWorldEvents();
    const achievementEvents: AchievementEvent[][] = [];
    events.on("achievementEvents", (emitted) => {
      achievementEvents.push(emitted);
    });
    const { offerFrostbearingTree } = useWorldOfferings({
      events,
      frostbearingTreeProgress,
      gainWorldAdventureExp: (amount) => {
        gainedAdventureExps.push(amount);
      },
      gameDataBaseUrl: GAME_DATA_LOCAL_BASE_URL,
      inventory,
      materialDataMap,
      nameText: englishNameText,
      placeWorldDrops: (source, droppedItems) => {
        placedDrops.push([source, droppedItems]);
      },
      setInventory: (nextInventory) => {
        inventory.value = nextInventory;
      },
      setWallet: (nextWallet) => {
        wallet.value = nextWallet;
      },
      wallet,
    });
    const offer = offerFrostbearingTree(frostbearingTreePlace);
    inventory.value = { items: [{ definition, id: 0, quantity: offeringItem.itemCount }], nextId: 1 };
    const {
      adventureExp,
      inventory: offeredInventory,
      overflowItems,
      progress,
      wallet: paidWallet,
    } = offerBagItems(
      inventory.value,
      wallet.value,
      { ...frostbearingTreeProgress.value, levels },
      englishNameText,
      materialDataMap,
    );
    await offer;

    expect(inventory.value).toStrictEqual(offeredInventory);
    expect(wallet.value).toStrictEqual(paidWallet);
    expect(gainedAdventureExps).toStrictEqual([adventureExp]);
    expect(placedDrops).toStrictEqual([[frostbearingTreePlace, overflowItems]]);
    expect(frostbearingTreeProgress.value).toStrictEqual({ heldCounts: progress.heldCounts, level: progress.level });
    expect(achievementEvents).toStrictEqual([
      [
        {
          kind: AchievementEventKind.OfferingLevelReached,
          quantity: progress.level,
          targetId: String(FROSTBEARING_TREE_OFFERING_ID),
        },
      ],
    ]);
  });
});
