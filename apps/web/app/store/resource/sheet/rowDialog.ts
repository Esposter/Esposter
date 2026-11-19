import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { ToData } from "@esposter/shared";

// Keyed by the sheet a dialog was opened on: a duplicated sheet keeps its rows' ids, so an app-lifetime target would
// Re-open the dialog over the copy's same rows
export const useRowDialogStore = defineStore("resource/sheet/rowDialog", () => {
  const { data: editingId } = useCurrentResourceDataMap<ToData<Row>["id"]>("");
  // One row from its own delete button, or the selection from the toolbar
  const { data: deletingIds } = useCurrentResourceDataMap<ToData<Row>["id"][]>([]);
  return { deletingIds, editingId };
});
