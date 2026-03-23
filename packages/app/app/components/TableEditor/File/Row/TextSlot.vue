<script setup lang="ts">
import { useRowStore } from "@/store/tableEditor/file/row";

const rowStore = useRowStore();
const { search } = storeToRefs(rowStore);
</script>

<template>
  <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" variant="outlined" hide-details single-line />
  <TableEditorFileFindReplaceBar />
</template>
