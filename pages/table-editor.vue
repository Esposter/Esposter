<script setup lang="ts">
import { TableEditorConfiguration } from "@/models/tableEditor/TableEditorConfiguration";
import { ITEM_ID_QUERY_PARAM_KEY, TABLE_EDITOR_STORE } from "@/services/tableEditor/constants";
import { todoListItemCategoryDefinitions } from "@/services/tableEditor/todoList/itemCategoryDefinition";
import { useTableEditorStore } from "@/store/tableEditor";
import { jsonDateParse } from "@/utils/json";

const { $client } = useNuxtApp();
const { status } = useAuth();
const route = useRoute();
const tableEditorStore = useTableEditorStore()();
const { editItem } = tableEditorStore;
const { tableEditorConfiguration } = storeToRefs(tableEditorStore);

if (status.value === "authenticated")
  tableEditorConfiguration.value = await $client.tableEditor.readTableEditor.query();

useConfirmBeforeNavigation();

onMounted(() => {
  if (status.value === "unauthenticated") {
    const tableEditorStore = localStorage.getItem(TABLE_EDITOR_STORE);
    tableEditorConfiguration.value = tableEditorStore
      ? jsonDateParse(tableEditorStore)
      : new TableEditorConfiguration();
  }

  const itemId = route.query[ITEM_ID_QUERY_PARAM_KEY];
  if (typeof itemId === "string" && uuidValidateV4(itemId)) editItem(itemId);
});

onUnmounted(() => {
  tableEditorConfiguration.value = null;
});
</script>

<template>
  <NuxtLayout>
    <TableEditorCrudView :item-category-definitions="todoListItemCategoryDefinitions" />
  </NuxtLayout>
</template>
