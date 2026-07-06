import { useTableEditorStore } from "@/store/tableEditor";

export const useReadTableEditorConfiguration = async () => {
  const tableEditorStore = useTableEditorStore();
  const { load, loadLocal } = tableEditorStore;
  await useReadData(loadLocal, load);
};
