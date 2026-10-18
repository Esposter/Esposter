import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Interactable } from "#src/models/interaction/Interactable";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { WorldDrop } from "#src/models/world/WorldDrop";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { Ref, ShallowRef } from "vue";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { computeChestInteractables } from "#src/services/chest/computeChestInteractables";
import { openChest } from "#src/services/chest/openChest";
import { readMondstadtChestPlaces } from "#src/services/chest/readMondstadtChestPlaces";
import { getResultAsync } from "@esposter/shared";
import { computed, shallowRef } from "vue";

// Mondstadt's chests, fetched by their key as the world opens, and each unopened one offered to open on the ground
// Beneath its point. Opening a chest rolls its Primogems and Mora into the wallet, pays its Adventure EXP to the
// Adventure Rank and pours its drops out where it stands, and the chest is kept as opened. A load that fails is logged
// And left off, so no chest is offered rather than a wrong one
export const useWorldChests = ({
  events,
  gameDataBaseUrl,
  gameText,
  gainWorldAdventureExp,
  getGroundHeight,
  openedChestIds,
  placeWorldDrops,
  setWallet,
  wallet,
}: {
  events: WorldEvents;
  gameDataBaseUrl: string;
  gameText: Readonly<Record<string, string>>;
  gainWorldAdventureExp: (amount: number) => void;
  getGroundHeight: (x: number, z: number) => number;
  openedChestIds: ShallowRef<ReadonlySet<string>>;
  placeWorldDrops: (source: Pick<WorldDrop, "id" | "position">, droppedItems: DroppedItem[]) => void;
  setWallet: (nextWallet: Wallet) => void;
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
  // The chest a row names is opened once: its wallet and its drops are applied, and it is kept as opened
  const openChestById = (chestId: string, random: () => number) => {
    const chestPlace = chestPlaces.value.find(({ id }) => id === chestId);
    if (!chestPlace) return;
    const previousOpenedChestIds = openedChestIds.value;
    const opening = openChest(chestPlace, previousOpenedChestIds, wallet.value, random);
    setWallet(opening.wallet);
    gainWorldAdventureExp(opening.adventureExp);
    openedChestIds.value = opening.openedChestIds;
    placeWorldDrops(chestPlace, opening.drops);
    if (opening.openedChestIds !== previousOpenedChestIds)
      events.emit("achievementEvents", [{ kind: AchievementEventKind.ChestOpened, quantity: 1, targetId: chestId }]);
  };
  return { chestInteractables, openChestById };
};
