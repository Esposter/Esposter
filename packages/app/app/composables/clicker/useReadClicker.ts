import type { RecursiveDeepOmitItemEntity } from "#shared/util/types/RecursiveDeepOmitItemEntity";

import { Clicker } from "#shared/models/clicker/data/Clicker";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { CLICKER_LOCAL_STORAGE_KEY } from "@/services/clicker/constants";
import { omitDeepItemEntity } from "@/services/shared/metadata/omitDeepItemEntity";
import { useClickerStore } from "@/store/clicker";
import deepEqual from "fast-deep-equal";

export const useReadClicker = async () => {
  const { $trpc } = useNuxtApp();
  const clickerStore = useClickerStore();
  const { saveClicker } = clickerStore;
  const { clicker } = storeToRefs(clickerStore);
  // This is used for tracking when we should save
  // i.e. every time the user manually updates the state
  // which is everything excluding automatic updates like noPoints
  const virtualClicker = computed<RecursiveDeepOmitItemEntity<Clicker, ["noPoints", "producedValue"]>>(
    (oldVirtualClicker) => {
      const newVirtualClicker = omitDeepItemEntity(clicker.value, "noPoints", "producedValue");
      return oldVirtualClicker && deepEqual(newVirtualClicker, oldVirtualClicker)
        ? oldVirtualClicker
        : newVirtualClicker;
    },
  );

  watch(virtualClicker, async () => {
    await saveClicker();
  });

  await useReadData(
    () => {
      const clickerStoreJson = localStorage.getItem(CLICKER_LOCAL_STORAGE_KEY);
      if (clickerStoreJson) clicker.value = Object.assign(new Clicker(), jsonDateParse(clickerStoreJson));
      else clicker.value = new Clicker();
    },
    async () => {
      clicker.value = await $trpc.clicker.readClicker.query();
    },
  );
};
