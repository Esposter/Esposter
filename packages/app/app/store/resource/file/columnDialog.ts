import type { Column } from "#shared/models/resource/file/column/Column";

export const useColumnDialogStore = defineStore("resource/file/columnDialog", () => {
  const chartingColumnName = ref<Column["name"]>("");
  const deletingColumnName = ref<Column["name"]>("");
  const editingColumnName = ref<Column["name"]>("");
  return {
    chartingColumnName,
    deletingColumnName,
    editingColumnName,
  };
});
