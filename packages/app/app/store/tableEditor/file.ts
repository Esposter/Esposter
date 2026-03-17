export const useFileTableEditorStore = defineStore("tableEditor/file", () => {
  const selectedRowIds = ref<string[]>([]);
  return { selectedRowIds };
});
