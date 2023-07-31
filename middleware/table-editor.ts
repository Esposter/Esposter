import { TableEditorConfiguration } from "@/models/tableEditor/TableEditorConfiguration";
import { TABLE_EDITOR_STORE } from "@/services/tableEditor/constants";
import { useTableEditorStore } from "@/store/tableEditor";
import { jsonDateParse } from "@/utils/json";

export default defineNuxtRouteMiddleware(async () => {
  if (isServer()) return;

  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const tableEditorStore = useTableEditorStore()();
  const { tableEditorConfiguration } = storeToRefs(tableEditorStore);

  if (status.value === "authenticated") {
    tableEditorConfiguration.value = await $client.tableEditor.readTableEditor.query();
    return;
  }

  const tableEditorStoreJson = localStorage.getItem(TABLE_EDITOR_STORE);
  tableEditorConfiguration.value = tableEditorStoreJson
    ? jsonDateParse(tableEditorStoreJson)
    : new TableEditorConfiguration();
});
