<script setup lang="ts">
import { useRowStore } from "@/store/tableEditor/file/row";

const rowStore = useRowStore();
const { copyIncludesHeaders, search } = storeToRefs(rowStore);
</script>

<template>
  <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" hide-details single-line />
  <v-tooltip :text="copyIncludesHeaders ? 'Headers included in copy' : 'Headers excluded from copy'">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        :icon="copyIncludesHeaders ? 'mdi-eye' : 'mdi-eye-off'"
        :variant="copyIncludesHeaders ? 'tonal' : 'text'"
        size="small"
        tile
        :="tooltipProps"
        @click="copyIncludesHeaders = !copyIncludesHeaders"
      />
    </template>
  </v-tooltip>
  <TableEditorFileFindReplaceBar />
</template>
