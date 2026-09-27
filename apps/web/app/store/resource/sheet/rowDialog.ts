import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { useResourceStore } from "@/store/resource";

// Keyed by the sheet a dialog was opened on: a duplicated sheet keeps its rows' ids, so an app-lifetime target would
// Re-open the dialog over the copy's same rows
export const useRowDialogStore = defineStore("resource/sheet/rowDialog", () => {
  const resourceStore = useResourceStore();
  const { data: editingId } = useDataMap<Row["id"]>(() => resourceStore.currentResourceId, "");
  // One row from its own delete button, or the selection from the toolbar
  const { data: deletingIds } = useDataMap<Row["id"][]>(() => resourceStore.currentResourceId, []);
  return { deletingIds, editingId };
});
