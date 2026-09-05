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
  // The save watcher's subject: everything the user changes by hand. pointCount and producedValue move on every
  // Tick and updatedAt is stamped by the save itself, so watching them would retrigger the save
  const virtualClicker = computed((oldVirtualClicker) => {
    const newVirtualClicker = omitDeep(clicker.value, "pointCount", "producedValue", "updatedAt");
    return oldVirtualClicker && deepEqual(newVirtualClicker, oldVirtualClicker) ? oldVirtualClicker : newVirtualClicker;
  });

  watch(virtualClicker, async () => {
    await saveClicker();
  });

  await useReadData(
    async () => {
      // eslint-disable-next-line no-restricted-syntax -- the offline save system reads and writes this key imperatively through `useSaveToLocalStorage`; a ref would be a second owner of it. The read is already client-only, inside `useReadData`'s `onMounted` — see the browser-boundary ledger
      const clickerJson = window.localStorage.getItem(LocalStorageKey.ClickerStore);
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
