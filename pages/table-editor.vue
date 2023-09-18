<script setup lang="ts">
import { ITEM_ID_QUERY_PARAM_KEY } from "@/services/tableEditor/constants";
import { todoListItemCategoryDefinitions } from "@/services/tableEditor/todoList/itemCategoryDefinition";
import { useTableEditorStore } from "@/store/tableEditor";
import { uuidValidateV4 } from "@/util/uuid";

await useReadTableEditor();
const route = useRoute();
const tableEditorStore = useTableEditorStore()();
const { editItem } = tableEditorStore;

useConfirmBeforeNavigation();

onMounted(() => {
  const itemId = route.query[ITEM_ID_QUERY_PARAM_KEY];
  if (typeof itemId === "string" && uuidValidateV4(itemId)) editItem(itemId);
});
</script>

<template>
  <NuxtLayout>
    <TableEditorCrudView :item-category-definitions="todoListItemCategoryDefinitions" />
  </NuxtLayout>
</template>
