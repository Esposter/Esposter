import type { Row } from "#shared/models/resource/sheet/datasource/Row";

export const useRowDialogStore = defineStore("resource/sheet/rowDialog", () => {
  const deletingId = ref<Row["id"]>("");
  const editingId = ref<Row["id"]>("");
  return {
    deletingId,
    editingId,
  };
});
