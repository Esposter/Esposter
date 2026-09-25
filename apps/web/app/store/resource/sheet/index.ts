import type { SheetResource } from "#shared/models/resource/sheet/SheetResource";

import { createContentData } from "@/services/resource/createContentData";
import { createDefaultSheetResource } from "@/services/resource/sheet/createDefaultSheetResource";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { ResourceType } from "@esposter/db-schema";

export const useSheetStore = defineStore("resource/sheet", () => {
  const sheetHistoryStore = useSheetHistoryStore();
  const { clear } = sheetHistoryStore;
  const {
    content: sheetResource,
    getContentWriter,
    loadContent,
    saveContent: saveSheet,
  } = createContentData<ResourceType.Sheet, SheetResource>(
    ResourceType.Sheet,
    // Content is parsed from the blob with plain JSON.parse, so the loaded value carries the sheet's data
    // Shape rather than its class instances. Reviving them the way the dashboard does would mean walking
    // Every row and column of a sheet on open, and buys nothing: `toJSON` is the only method these classes
    // Have, and it returns what `JSON.stringify` produces without it. ResourceContent.test-d.ts holds that
    // Invariant, so the cast stops compiling if a second method is ever added
    (data) => (data as SheetResource | undefined) ?? createDefaultSheetResource(),
  );
  // The grid operates on the data section; settings is the parse configuration the Settings blade edits
  const dataSource = computed(() => sheetResource.value.data);
  const settings = computed(() => sheetResource.value.settings);
  // The ref is replaced only when the content is read — another resource's opening, or a restore of this one —
  // And commands recorded against the content it held must not be undoable onto what replaced it
  watch(sheetResource, () => {
    clear();
  });
  return { dataSource, getContentWriter, loadContent, saveSheet, settings, sheetResource };
});
