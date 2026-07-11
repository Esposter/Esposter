import type { Row } from "#shared/models/resource/file/datasource/Row";

export const useRowDialogStore = defineStore("resource/file/rowDialog", () => {
  const deletingId = ref<Row["id"]>("");
  const editingId = ref<Row["id"]>("");
  return {
    deletingId,
    editingId,
  };
});
