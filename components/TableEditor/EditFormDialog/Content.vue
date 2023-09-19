<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";

defineSlots<{ default: (props: {}) => unknown }>();

const tableEditorStore = useTableEditorStore()();
const { editFormRef } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-form ref="editFormRef" overflow-y="auto" @submit="(e) => e.preventDefault()">
    <StyledCard>
      <TableEditorEditFormDialogHeader />
      <v-divider thickness="2" />
      <slot />
    </StyledCard>
  </v-form>
</template>
