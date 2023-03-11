<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
const { save } = tableEditorStore;
</script>

<template>
  <v-tooltip text="Save & Close">
    <template #activator="{ props }">
      <v-btn icon="mdi-content-save" :="props" @click="save" />
    </template>
  </v-tooltip>
</template>
