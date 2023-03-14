<script setup lang="ts">
import { TableEditor } from "@/models/tableEditor/TableEditor";
import { TABLE_EDITOR_STORE } from "@/services/tableEditor/constants";
import { useTableEditorStore } from "@/store/tableEditor";

const { $client } = useNuxtApp();
const { status } = useSession();
const tableEditorStore = useTableEditorStore();
const { tableEditor } = storeToRefs(tableEditorStore);

if (status.value === "authenticated") tableEditor.value = await $client.tableEditor.readTableEditor.query();

useTimers();

onMounted(() => {
  if (status.value === "unauthenticated") {
    const tableEditorStore = localStorage.getItem(TABLE_EDITOR_STORE);
    tableEditor.value = tableEditorStore ? JSON.parse(tableEditorStore) : new TableEditor();
  }
});

onUnmounted(() => {
  tableEditor.value = null;
});
</script>

<template>
  <NuxtLayout>
    <TableEditorCrudView />
  </NuxtLayout>
</template>
