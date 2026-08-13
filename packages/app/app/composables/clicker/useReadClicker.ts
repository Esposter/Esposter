import { Clicker } from "#shared/models/clicker/data/Clicker";
import { toClicker } from "@/services/clicker/save/toClicker";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useClickerStore } from "@/store/clicker";
import { useOfflineProgressStore } from "@/store/clicker/offlineProgress";
import { getResult, jsonDateParse } from "@esposter/shared";
import deepEqual from "fast-deep-equal";
import { omitDeep } from "lodash-omitdeep";

export const useReadClicker = async () => {
  const { $trpc } = useNuxtApp();
  const clickerStore = useClickerStore();
  const { saveClicker, setClicker } = clickerStore;
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
    async () => {
      const clickerJson = localStorage.getItem(LocalStorageKey.ClickerStore);
      setClicker(
        clickerJson
          ? getResult(() => jsonDateParse(clickerJson))
              .map((savedClicker) => toClicker(savedClicker))
              .orTee(console.error)
              .unwrapOr(new Clicker())
          : new Clicker(),
      );
      await applyOfflineProgress();
    },
    async () => {
      setClicker(toClicker(await $trpc.clicker.readClicker.query()));
      await applyOfflineProgress();
    },
  );
};
