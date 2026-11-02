import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { WorldSessionContext } from "#src/models/world/WorldSessionContext";

import { computeBagObtainEvents } from "#src/services/achievement/computeBagObtainEvents";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { NotInitializedError } from "@esposter/shared";
import { defineStore } from "pinia";
import { computed, markRaw, ref, shallowRef } from "vue";

// What every feature of a world session shares and none owns: the context it started with, the one emitter its systems
// React through, and the bag and wallet that pay for and take in nearly every one of them. The session starts it as it
// Mounts and stops it as it unmounts, so a second session starts from nothing
export const useWorldSessionStore = defineStore("world/session", () => {
  const events: WorldEvents = markRaw(createWorldEvents());
  const context = shallowRef<WorldSessionContext>();
  const inventory = ref<Inventory>({ ...EMPTY_INVENTORY });
  const wallet = ref<Wallet>({ ...EMPTY_WALLET });
  const getContext = () => {
    if (!context.value) throw new NotInitializedError("WorldSessionStore");
    return context.value;
  };
  const gameDataBaseUrl = computed(() => getContext().gameDataBaseUrl);
  const gameText = computed(() => getContext().gameText);
  const language = computed(() => getContext().language);
  const materialDataMap = computed(() => getContext().materialDataMap);
  const nameText = computed(() => getContext().nameText);
  const worldNow = computed(() => getContext().worldNow.value);
  const getWorldNow = () => getContext().getWorldNow();
  const start = (nextContext: WorldSessionContext, savedBag: { inventory: Inventory; wallet: Wallet }) => {
    events.clear();
    context.value = nextContext;
    inventory.value = savedBag.inventory;
    wallet.value = savedBag.wallet;
  };
  const stop = () => {
    events.clear();
    context.value = undefined;
    inventory.value = { ...EMPTY_INVENTORY };
    wallet.value = { ...EMPTY_WALLET };
  };
  // Every change to the bag goes through here, so the Archive opens the entries of what the bag takes in, and the
  // Achievements count what it takes in as their obtain doings
  const setInventory = (nextInventory: Inventory) => {
    const obtainEvents = computeBagObtainEvents(inventory.value.items, nextInventory.items);
    inventory.value = nextInventory;
    events.emit("bagChange", nextInventory);
    if (obtainEvents.length > 0) events.emit("achievementEvents", obtainEvents);
  };
  const setWallet = (nextWallet: Wallet) => {
    wallet.value = nextWallet;
  };
  return {
    events,
    gameDataBaseUrl,
    gameText,
    getWorldNow,
    inventory,
    language,
    materialDataMap,
    nameText,
    setInventory,
    setWallet,
    start,
    stop,
    wallet,
    worldNow,
  };
});
