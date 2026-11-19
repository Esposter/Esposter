import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ToData } from "@esposter/shared";

// Keyed by the sheet a dialog was opened on: a target is a column name, which the next sheet opened very likely has
// Too, so an app-lifetime target would re-open the dialog over that sheet's same-named column
export const useColumnDialogStore = defineStore("resource/sheet/columnDialog", () => {
  const { data: chartingColumnName } = useCurrentResourceDataMap<ToData<Column>["name"]>("");
  const { data: editingColumnName } = useCurrentResourceDataMap<ToData<Column>["name"]>("");
  // One column from its commands, or the selection from the toolbar
  const { data: deletingColumnIds } = useCurrentResourceDataMap<ToData<Column>["id"][]>([]);
  return { chartingColumnName, deletingColumnIds, editingColumnName };
});
