import { Clicker } from "#shared/models/clicker/data/Clicker";
import { CLICKER_LOCAL_STORAGE_KEY } from "@/services/clicker/constants";
import { useClickerStore } from "@/store/clicker";
import { jsonDateParse } from "@esposter/shared";
import deepEqual from "fast-deep-equal";
import { omitDeep } from "lodash-omitdeep";

export const useReadClicker = async () => {
  const { $trpc } = useNuxtApp();
  const clickerStore = useClickerStore();
  const { saveClicker } = clickerStore;
  const { clicker } = storeToRefs(clickerStore);
  // This is used for tracking when we should save
  // I.e. every time the user manually updates the state
  // Which is everything excluding automatic updates like noPoints
  const virtualClicker = computed((oldVirtualClicker) => {
    const newVirtualClicker = omitDeep(clicker.value, "noPoints", "producedValue");
    return oldVirtualClicker && deepEqual(newVirtualClicker, oldVirtualClicker) ? oldVirtualClicker : newVirtualClicker;
  });

  watch(virtualClicker, async () => {
    await saveClicker();
  });

  await useReadData(
    () => {
      const clickerJson = localStorage.getItem(CLICKER_LOCAL_STORAGE_KEY);
      clicker.value = clickerJson ? new Clicker(jsonDateParse(clickerJson)) : new Clicker();
    },
    async () => {
      clicker.value = await $trpc.clicker.readClicker.query();
    },
  );
};
