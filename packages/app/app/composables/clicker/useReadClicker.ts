import { Clicker } from "#shared/models/clicker/data/Clicker";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useClickerStore } from "@/store/clicker";
import { useOfflineProgressStore } from "@/store/clicker/offlineProgress";
import { jsonDateParse } from "@esposter/shared";
import deepEqual from "fast-deep-equal";
import { omitDeep } from "lodash-omitdeep";

export const useReadClicker = async () => {
  const { $trpc } = useNuxtApp();
  const clickerStore = useClickerStore();
  const { saveClicker } = clickerStore;
  const { clicker } = storeToRefs(clickerStore);
  const offlineProgressStore = useOfflineProgressStore();
  const { applyOfflineProgress } = offlineProgressStore;
  // This is used for tracking when we should save
  // I.e. every time the user manually updates the state
  // Which is everything excluding automatic updates like noPoints
  // And updatedAt, which is stamped by saving itself and must not retrigger the save watcher
  const virtualClicker = computed((oldVirtualClicker) => {
    const newVirtualClicker = omitDeep(clicker.value, "noPoints", "producedValue", "updatedAt");
    return oldVirtualClicker && deepEqual(newVirtualClicker, oldVirtualClicker) ? oldVirtualClicker : newVirtualClicker;
  });

  watch(virtualClicker, async () => {
    await saveClicker();
  });

  await useReadData(
    () => {
      const clickerJson = localStorage.getItem(LocalStorageKey.ClickerStore);
      clicker.value = clickerJson ? new Clicker(jsonDateParse(clickerJson)) : new Clicker();
      applyOfflineProgress();
    },
    async () => {
      clicker.value = await $trpc.clicker.readClicker.query();
      applyOfflineProgress();
    },
  );
};
