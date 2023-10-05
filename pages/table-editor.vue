<script setup lang="ts">
import { TableEditorType } from "@/models/tableEditor/TableEditorType";
import { ITEM_ID_QUERY_PARAM_KEY, ITEM_TYPE_QUERY_PARAM_KEY } from "@/services/tableEditor/constants";
import { todoListItemCategoryDefinitions } from "@/services/tableEditor/todoList/itemCategoryDefinition";
import { useTableEditorStore } from "@/store/tableEditor";
import { uuidValidateV4 } from "@/util/uuid";

await useReadTableEditor();
useConfirmBeforeNavigation();
const route = useRoute();
const tableEditorStore = useTableEditorStore()();
const { editItem } = tableEditorStore;
const { tableEditorType } = storeToRefs(tableEditorStore);

onMounted(() => {
  const itemType = route.query[ITEM_TYPE_QUERY_PARAM_KEY];
  for (const type of Object.values(TableEditorType)) if (type === itemType) tableEditorType.value = itemType;

  const itemId = route.query[ITEM_ID_QUERY_PARAM_KEY];
  if (typeof itemId === "string" && uuidValidateV4(itemId)) editItem(itemId);
});
</script>

<template>
  <NuxtLayout>
    <TableEditorCrudView :item-category-definitions="todoListItemCategoryDefinitions" />
  </NuxtLayout>
</template>
