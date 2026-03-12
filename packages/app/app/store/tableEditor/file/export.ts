export const useFileExportTableEditorStore = defineStore("tableEditor/file/export", () => {
  const selectedColumnIds = ref<string[]>([]);
  return { selectedColumnIds };
});
