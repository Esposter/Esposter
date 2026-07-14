import type { SheetResource } from "#shared/models/resource/sheet/SheetResource";

import { createDefaultSheetResource } from "@/services/resource/sheet/createDefaultSheetResource";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";

export const useSheetStore = defineStore("resource/sheet", () => {
  const route = useRoute();
  // The store outlives the page, so the id is read from the route per call rather than captured once
  const { load, readContent, resource, save } = useResource(() =>
    Array.isArray(route.params.id) ? (route.params.id[0] ?? "") : (route.params.id ?? ""),
  );
  const sheetHistoryStore = useSheetHistoryStore();
  const { clear } = sheetHistoryStore;
  const sheetResource = ref<SheetResource>(createDefaultSheetResource());
  // The grid operates on the data section; settings is the parse configuration the Settings blade edits
  const dataSource = computed(() => sheetResource.value.data);
  const settings = computed(() => sheetResource.value.settings);
  const loadContent = async () => {
    await load();
    const data = await readContent();
    sheetResource.value = (data as SheetResource | undefined) ?? createDefaultSheetResource();
    // Another resource's commands must not be undoable onto this one
    clear();
  };
  const saveSheet = () => save(sheetResource.value);
  return { dataSource, loadContent, resource, saveSheet, settings, sheetResource };
});
