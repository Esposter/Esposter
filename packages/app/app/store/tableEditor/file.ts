export const useFileTableEditorStore = defineStore("tableEditor/file", () => {
  const isOutlierHighlightEnabled = ref(false);
  const selectedRowIds = ref<string[]>([]);
  return { isOutlierHighlightEnabled, selectedRowIds };
});
