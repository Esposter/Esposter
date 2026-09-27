import type { Row } from "#shared/models/resource/sheet/datasource/Row";

export const useRowDialogStore = defineStore("resource/sheet/rowDialog", () => {
  const editingId = ref<Row["id"]>("");
  // One row from its own delete button, or the selection from the toolbar
  const deletingIds = ref<Row["id"][]>([]);
  return { deletingIds, editingId };
});
