import { TableEditorConfiguration } from "#shared/models/tableEditor/TableEditorConfiguration";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { TABLE_EDITOR_LOCAL_STORAGE_KEY } from "@/services/tableEditor/constants";
import { useTableEditorStore } from "@/store/tableEditor";

export const useReadTableEditor = async () => {
  const { $trpc } = useNuxtApp();
  const tableEditorStore = useTableEditorStore();
  const { tableEditorConfiguration } = storeToRefs(tableEditorStore);
  await useReadData(
    () => {
      const tableEditorStoreJson = localStorage.getItem(TABLE_EDITOR_LOCAL_STORAGE_KEY);
      if (tableEditorStoreJson)
        tableEditorConfiguration.value = Object.assign(
          new TableEditorConfiguration(),
          jsonDateParse(tableEditorStoreJson),
        );
      else tableEditorConfiguration.value = new TableEditorConfiguration();
    },
    async () => {
      tableEditorConfiguration.value = await $trpc.tableEditor.readTableEditor.query();
    },
  );
};
