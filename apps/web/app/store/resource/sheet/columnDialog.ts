import type { Column } from "#shared/models/resource/sheet/column/Column";

import { useResourceStore } from "@/store/resource";

// Keyed by the sheet a dialog was opened on: a target is a column name, which the next sheet opened very likely has
// Too, so an app-lifetime target would re-open the dialog over that sheet's same-named column
export const useColumnDialogStore = defineStore("resource/sheet/columnDialog", () => {
  const resourceStore = useResourceStore();
  const { data: chartingColumnName } = useDataMap<Column["name"]>(() => resourceStore.currentResourceId, "");
  const { data: editingColumnName } = useDataMap<Column["name"]>(() => resourceStore.currentResourceId, "");
  return { chartingColumnName, editingColumnName };
});
