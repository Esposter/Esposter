import { TableEditorConfiguration } from "#shared/models/tableEditor/data/TableEditorConfiguration";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { TABLE_EDITOR_LOCAL_STORAGE_KEY } from "@/services/tableEditor/constants";
import { useTableEditorStore } from "@/store/tableEditor";

export const useReadTableEditorConfiguration = async () => {
  const { $trpc } = useNuxtApp();
  const tableEditorStore = useTableEditorStore();
  const { tableEditorConfiguration } = storeToRefs(tableEditorStore);
  await useReadData(
    () => {
      const tableEditorConfigurationJson = localStorage.getItem(TABLE_EDITOR_LOCAL_STORAGE_KEY);
      if (tableEditorConfigurationJson)
        tableEditorConfiguration.value = Object.assign(
          new TableEditorConfiguration(),
          jsonDateParse(tableEditorConfigurationJson),
        );
      else tableEditorConfiguration.value = new TableEditorConfiguration();
    },
    async () => {
      tableEditorConfiguration.value = await $trpc.tableEditor.readTableEditorConfiguration.query();
    },
  );
};
