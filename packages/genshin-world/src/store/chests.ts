import type { ChestLockSource } from "#src/models/chest/ChestLockSource";
import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Interactable } from "#src/models/interaction/Interactable";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { Currency } from "#src/models/inventory/Currency";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { computeChestInteractables } from "#src/services/chest/computeChestInteractables";
import { openChest } from "#src/services/chest/openChest";
import { readMondstadtChestPlaces } from "#src/services/chest/readMondstadtChestPlaces";
import { checkIsDropFallingAway } from "#src/services/interaction/checkIsDropFallingAway";
import { addDroppedItem } from "#src/services/inventory/addDroppedItem";
import { getDroppedItemDefinition } from "#src/services/inventory/getDroppedItemDefinition";
import { useWorldAdventureRankStore } from "#src/store/adventureRank";
import { useWorldGroundStore } from "#src/store/ground";
import { useWorldPickupsStore } from "#src/store/pickups";
import { useWorldPuzzlesStore } from "#src/store/puzzles";
import { useWorldSessionStore } from "#src/store/session";
import { getResultAsync, getSynchronizedFunction } from "@esposter/shared";
import { defineStore } from "pinia";
import { computed, shallowRef } from "vue";

// Mondstadt's chests, fetched by their key as the world opens, and each one offered on the ground beneath its point: an
// Unopened chest to open, and a buried one to dig up. Digging a buried chest holds it dug for the session only, and a
// Dug chest is offered to open, paying nothing until its tier is measured. Opening a chest rolls its Primogems, Mora and
// Anemo Sigils into the wallet, pays its Adventure EXP to the Adventure Rank and pours its drops out where it stands, or
// Sends them to the bag where a drop would fall away there, and the chest is kept as opened. The chests the puzzles
// Spawn are offered and opened the same way. A load that fails is logged and left off, so no chest is offered rather
// Than a wrong one. A chest within reach of a camp or puzzle not yet done is offered nothing to open until it is done. The
// Chests opened are the save's, and the session starts it with them and the water's level, and stops it as it unmounts
export const useWorldChestsStore = defineStore("world/chests", () => {
  const worldPuzzlesStore = useWorldPuzzlesStore();
  const worldPickupsStore = useWorldPickupsStore();
  const { placeWorldDrops } = worldPickupsStore;
  const worldGroundStore = useWorldGroundStore();
  const { getGroundHeight } = worldGroundStore;
  const worldSessionStore = useWorldSessionStore();
  const { events, setInventory, setWallet } = worldSessionStore;
  const chestPlaces = shallowRef<ChestPlace[]>([]);
  const openedChestIds = shallowRef<ReadonlySet<string>>(new Set());
  let waterLevel = 0;
  // The camps' chest locks as the Enemies component writes them, and each time trial's lock until it is solved
  const campLockSources = shallowRef<ChestLockSource[]>([]);
  const lockSources = computed<ChestLockSource[]>(() => [
    ...campLockSources.value,
    ...worldPuzzlesStore.timeTrialMarkers.map(({ id, position }) => ({
      isDone: worldPuzzlesStore.solvedPuzzleIds.has(id),
      positions: [position],
    })),
  ]);
  // The buried chests dug up this session, which the save does not hold yet, so a reload buries them again
  const dugChestIds = shallowRef<ReadonlySet<string>>(new Set());
  const worldChestPlaces = computed(() => [...chestPlaces.value, ...worldPuzzlesStore.puzzleChestPlaces]);
  const chestInteractables = computed<Interactable[]>(() =>
    computeChestInteractables(
      worldChestPlaces.value,
      openedChestIds.value,
      dugChestIds.value,
      worldSessionStore.gameText,
      getGroundHeight,
      lockSources.value,
    ),
  );
  const digChestById = (chestId: string) => {
    dugChestIds.value = new Set([...dugChestIds.value, chestId]);
  };
  const worldAdventureRankStore = useWorldAdventureRankStore();
  const { gainWorldAdventureExp } = worldAdventureRankStore;
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
      worldSessionStore.wallet,
      random,
      Currency.AnemoSigil,
      checkIsDropFallingAway(getGroundHeight(x, z), waterLevel),
      {
        artifactMainAffixPools: worldSessionStore.artifactMainAffixPools,
        artifactRarityDataMap: worldSessionStore.artifactRarityDataMap,
        reliquarySets: worldSessionStore.reliquarySets,
      },
    );
    setWallet(opening.wallet);
    gainWorldAdventureExp(opening.adventureExp);
    openedChestIds.value = opening.openedChestIds;
    let nextInventory = worldSessionStore.inventory;
    const overflowDrops: DroppedItem[] = [];
    for (const dropped of opening.bagDrops) {
      const { itemId } = dropped;
      const definition = getDroppedItemDefinition(
        itemId,
        worldSessionStore.nameText,
        worldSessionStore.weaponDataMap,
        worldSessionStore.materialDataMap,
        worldSessionStore.reliquaryPieceEntryMap,
      );
      const addition = addDroppedItem(nextInventory, dropped, definition);
      nextInventory = addition.inventory;
      if (addition.overflow > 0) overflowDrops.push({ ...dropped, count: addition.overflow });
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
  const start = (starting: { openedChestIds: ReadonlySet<string>; waterLevel: number }) => {
    openedChestIds.value = starting.openedChestIds;
    ({ waterLevel } = starting);
    getSynchronizedFunction(() =>
      getResultAsync(() => readMondstadtChestPlaces(worldSessionStore.gameDataBaseUrl)).match(
        (places) => {
          chestPlaces.value = places;
        },
        (error) => {
          console.error(error);
        },
      ),
    )();
  };
  const stop = () => {
    campLockSources.value = [];
    chestPlaces.value = [];
    dugChestIds.value = new Set();
    openedChestIds.value = new Set();
  };
  return {
    campLockSources,
    chestInteractables,
    digChestById,
    openChestById,
    openedChestIds,
    start,
    stop,
    worldChestPlaces,
  };
});
