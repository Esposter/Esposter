<script setup lang="ts">
import { useColumnStore } from "@/store/tableEditor/file/column";

const columnStore = useColumnStore();
const { search } = storeToRefs(columnStore);
</script>

<template>
  <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" hide-details single-line />
</template>
