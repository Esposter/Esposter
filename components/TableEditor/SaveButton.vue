<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
const { save } = tableEditorStore;
const { isSavable } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-tooltip text="Save & Close">
    <template #activator="{ props }">
      <v-btn icon="mdi-content-save" :disabled="!isSavable" :="props" @click="() => save()" />
    </template>
  </v-tooltip>
</template>
