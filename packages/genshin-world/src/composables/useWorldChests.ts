import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Interactable } from "#src/models/interaction/Interactable";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { WorldDrop } from "#src/models/world/WorldDrop";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { Ref, ShallowRef } from "vue";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { Currency } from "#src/models/inventory/Currency";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { computeChestInteractables } from "#src/services/chest/computeChestInteractables";
import { openChest } from "#src/services/chest/openChest";
import { readMondstadtChestPlaces } from "#src/services/chest/readMondstadtChestPlaces";
import { checkIsDropFallingAway } from "#src/services/interaction/checkIsDropFallingAway";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { getResultAsync } from "@esposter/shared";
import { computed, shallowRef } from "vue";

// Mondstadt's chests, fetched by their key as the world opens, and each unopened one offered to open on the ground
// Beneath its point. Opening a chest rolls its Primogems, Mora and Anemo Sigils into the wallet, pays its Adventure EXP
// To the Adventure Rank and pours its drops out where it stands, or sends them to the bag where a drop would fall away
// There, and the chest is kept as opened. A load that fails is logged and left off, so no chest is offered rather than a
// Wrong one
export const useWorldChests = ({
  events,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  gameText,
  getGroundHeight,
  inventory,
  materialDataMap,
  nameText,
  openedChestIds,
  placeWorldDrops,
  setInventory,
  setWallet,
  waterLevel,
  wallet,
}: {
  events: WorldEvents;
  gainWorldAdventureExp: (amount: number) => void;
  gameDataBaseUrl: string;
  gameText: Readonly<Record<string, string>>;
  getGroundHeight: (x: number, z: number) => number;
  inventory: Ref<Inventory>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  openedChestIds: ShallowRef<ReadonlySet<string>>;
  placeWorldDrops: (source: Pick<WorldDrop, "id" | "position">, droppedItems: DroppedItem[]) => void;
  setInventory: (nextInventory: Inventory) => void;
  setWallet: (nextWallet: Wallet) => void;
  waterLevel: number;
  wallet: Ref<Wallet>;
}) => {
  const chestPlaces = shallowRef<ChestPlace[]>([]);
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readMondstadtChestPlaces(gameDataBaseUrl)).match(
    (places) => {
      chestPlaces.value = places;
    },
    (error) => {
      console.error(error);
    },
  );
  const chestInteractables = computed<Interactable[]>(() =>
    computeChestInteractables(chestPlaces.value, openedChestIds.value, gameText, getGroundHeight),
  );
  // The chest a row names is opened once: its wallet is paid, its drops are poured out or bagged, and it is kept as opened.
  // Drops that fall away go straight into the bag, and what the bag has no room for is poured out where the chest stands
  const openChestById = (chestId: string, random: () => number) => {
    const chestPlace = chestPlaces.value.find(({ id }) => id === chestId);
    if (!chestPlace) return;
    const previousOpenedChestIds = openedChestIds.value;
    const { x, z } = chestPlace.position;
    const opening = openChest(
      chestPlace,
      previousOpenedChestIds,
      wallet.value,
      random,
      Currency.AnemoSigil,
      checkIsDropFallingAway(getGroundHeight(x, z), waterLevel),
    );
    setWallet(opening.wallet);
    gainWorldAdventureExp(opening.adventureExp);
    openedChestIds.value = opening.openedChestIds;
    let nextInventory = inventory.value;
    const overflowDrops: DroppedItem[] = [];
    for (const { count, itemId } of opening.bagDrops) {
      const addition = addInventoryItem(nextInventory, getItemDefinition(itemId, nameText, materialDataMap), count);
      nextInventory = addition.inventory;
      if (addition.overflow > 0) overflowDrops.push({ count: addition.overflow, itemId });
      events.emit("questEvent", { kind: QuestObjectiveKind.Collect, targetId: String(itemId) });
    }
    setInventory(nextInventory);
    placeWorldDrops(chestPlace, [...opening.drops, ...overflowDrops]);
    // A chest left as it was, opened already or of a kind with no reward, is no opening: it counts toward no achievement
    // And reaches no combat
    if (opening.openedChestIds.has(chestId) && !previousOpenedChestIds.has(chestId)) {
      events.emit("achievementEvents", [{ kind: AchievementEventKind.ChestOpened, quantity: 1, targetId: chestId }]);
      events.emit("chestOpened");
    }
  };
  return { chestInteractables, openChestById };
};
