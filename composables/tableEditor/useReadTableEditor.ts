import { TableEditorConfiguration } from "@/models/tableEditor/TableEditorConfiguration";
import { TABLE_EDITOR_STORE } from "@/services/tableEditor/constants";
import { useTableEditorStore } from "@/store/tableEditor";
import { jsonDateParse } from "@/util/json";

export const useReadTableEditor = async () => {
  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const tableEditorStore = useTableEditorStore()();
  const { tableEditorConfiguration } = storeToRefs(tableEditorStore);

  if (status.value === "authenticated") {
    tableEditorConfiguration.value = await $client.tableEditor.readTableEditor.query();
    return;
  }

  onMounted(() => {
    const tableEditorStoreJson = localStorage.getItem(TABLE_EDITOR_STORE);
    if (tableEditorStoreJson)
      tableEditorConfiguration.value = new TableEditorConfiguration(jsonDateParse(tableEditorStoreJson));
  });
};
