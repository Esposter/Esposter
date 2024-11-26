import { TableEditorConfiguration } from "@/models/tableEditor/TableEditorConfiguration";
import { TABLE_EDITOR_LOCAL_STORAGE_KEY } from "@/services/tableEditor/constants";
import { jsonDateParse } from "@/shared/util/time/jsonDateParse";
import { useTableEditorStore } from "@/store/tableEditor";

export const useReadTableEditor = async () => {
  const { $client } = useNuxtApp();
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
      tableEditorConfiguration.value = await $client.tableEditor.readTableEditor.query();
    },
  );
};
