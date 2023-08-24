<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore()();
const { save } = tableEditorStore;
const { isSavable } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-tooltip text="Save & Close">
    <template #activator="{ props }">
      <v-btn :="props" type="submit" icon="mdi-content-save" :disabled="!isSavable" @click="save" />
    </template>
  </v-tooltip>
</template>
