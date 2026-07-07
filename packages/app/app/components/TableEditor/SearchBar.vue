<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
const { searchQuery } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-text-field v-model="searchQuery" max-width="20rem" append-inner-icon="mdi-magnify" label="Search" hide-details />
</template>
