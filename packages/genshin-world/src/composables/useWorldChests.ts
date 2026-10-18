import type { ChestLockSource } from "#src/models/chest/ChestLockSource";
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

// Mondstadt's chests, fetched by their key as the world opens, and each one offered on the ground beneath its point: an
// Unopened chest to open, and a buried one to dig up. Digging a buried chest holds it dug for the session only, and a
// Dug chest is offered to open, paying nothing until its tier is measured. Opening a chest rolls its Primogems, Mora and
// Anemo Sigils into the wallet, pays its Adventure EXP to the Adventure Rank and pours its drops out where it stands, or
// Sends them to the bag where a drop would fall away there, and the chest is kept as opened. The chests the puzzles
// Spawn are offered and opened the same way. A load that fails is logged and left off, so no chest is offered rather
// Than a wrong one. A chest within reach of a camp or puzzle not yet done is offered nothing to open until it is done
export const useWorldChests = ({
  events,
  gainWorldAdventureExp,
  gameDataBaseUrl,
  gameText,
  getGroundHeight,
  inventory,
  lockSources,
  materialDataMap,
  nameText,
  openedChestIds,
  placeWorldDrops,
  puzzleChestPlaces,
  setInventory,
  setWallet,
  wallet,
  waterLevel,
}: {
  events: WorldEvents;
  gainWorldAdventureExp: (amount: number) => void;
  gameDataBaseUrl: string;
  gameText: Readonly<Record<string, string>>;
  getGroundHeight: (x: number, z: number) => number;
  inventory: Ref<Inventory>;
  lockSources: Readonly<Ref<ChestLockSource[]>>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  openedChestIds: ShallowRef<ReadonlySet<string>>;
  placeWorldDrops: (source: Pick<WorldDrop, "id" | "position">, droppedItems: DroppedItem[]) => void;
  puzzleChestPlaces: Readonly<Ref<ChestPlace[]>>;
  setInventory: (nextInventory: Inventory) => void;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
  waterLevel: number;
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
  // The buried chests dug up this session, which the save does not hold yet, so a reload buries them again
  const dugChestIds = shallowRef<ReadonlySet<string>>(new Set());
  const worldChestPlaces = computed(() => [...chestPlaces.value, ...puzzleChestPlaces.value]);
  const chestInteractables = computed<Interactable[]>(() =>
    computeChestInteractables(
      worldChestPlaces.value,
      openedChestIds.value,
      dugChestIds.value,
      gameText,
      getGroundHeight,
      lockSources.value,
    ),
  );
  const digChestById = (chestId: string) => {
    dugChestIds.value = new Set([...dugChestIds.value, chestId]);
  };
  // The chest a row names is opened once: its wallet is paid, its drops are poured out or bagged, and it is kept as opened.
  // Drops that fall away go straight into the bag, and what the bag has no room for is poured out where the chest stands
  const openChestById = (chestId: string, random: () => number) => {
    const chestPlace = worldChestPlaces.value.find(({ id }) => id === chestId);
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
  return { chestInteractables, digChestById, openChestById, worldChestPlaces };
};
