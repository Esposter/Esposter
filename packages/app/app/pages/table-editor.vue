<script setup lang="ts">
import { TableEditorType } from "#shared/models/tableEditor/TableEditorType";
import { ID_QUERY_PARAM_KEY, ITEM_TYPE_QUERY_PARAM_KEY } from "@/services/shared/constants";
import { getTableEditorTitle } from "@/services/tableEditor/getTableEditorTitle";
import { useTableEditorStore } from "@/store/tableEditor";
import { uuidValidateV4 } from "@esposter/shared";

defineRouteRules({ ssr: false });

await useReadTableEditor();
const route = useRoute();
const tableEditorStore = useTableEditorStore();
const { editItem } = tableEditorStore;
const { isDirty, tableEditorType } = storeToRefs(tableEditorStore);
const tableEditorTypeName = computed(() => getTableEditorTitle(tableEditorType.value));

useConfirmBeforeNavigation(isDirty);

onMounted(async () => {
  const itemType = route.query[ITEM_TYPE_QUERY_PARAM_KEY];
  if (Object.values(TableEditorType).some((type) => type === itemType))
    tableEditorType.value = itemType as TableEditorType;

  const itemId = route.query[ID_QUERY_PARAM_KEY];
  if (typeof itemId === "string" && uuidValidateV4(itemId)) await editItem({ id: itemId });
});
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ tableEditorTypeName }}</Title>
    </Head>
    <TableEditorCrudView />
  </NuxtLayout>
</template>
