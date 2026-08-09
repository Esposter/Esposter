import type { SheetResource } from "#shared/models/resource/sheet/SheetResource";
import type { ResourceType } from "@esposter/db-schema";

import { createDefaultSheetResource } from "@/services/resource/sheet/createDefaultSheetResource";
import { useResourceStore } from "@/store/resource";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";

export const useSheetStore = defineStore("resource/sheet", () => {
  const resourceStore = useResourceStore();
  const { readContent, readResource, saveContent, setPersistedContent } = resourceStore;
  const sheetHistoryStore = useSheetHistoryStore();
  const { clear } = sheetHistoryStore;
  const sheetResource = ref<SheetResource>(createDefaultSheetResource());
  // The grid operates on the data section; settings is the parse configuration the Settings blade edits
  const dataSource = computed(() => sheetResource.value.data);
  const settings = computed(() => sheetResource.value.settings);
  const loadContent = async () => {
    await readResource();
    const data = await readContent<ResourceType.Sheet>();
    // Content crosses the wire as plain JSON, so the loaded value carries the sheet's data shape rather than
    // Its class instances — the two differ only by the methods ToData strips. See the sweep ledger
    sheetResource.value = (data as SheetResource | undefined) ?? createDefaultSheetResource();
    // Seed the dirty check so the watcher's load echo compares equal instead of writing back
    setPersistedContent(sheetResource.value);
    // Another resource's commands must not be undoable onto this one
    clear();
  };
  const saveSheet = () => saveContent(sheetResource.value);
  return { dataSource, loadContent, saveSheet, settings, sheetResource };
});
