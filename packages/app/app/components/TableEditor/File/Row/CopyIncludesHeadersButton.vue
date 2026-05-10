<script setup lang="ts">
import { useRowStore } from "@/store/tableEditor/file/row";

const rowStore = useRowStore();
const { copyIncludesHeaders } = storeToRefs(rowStore);
</script>

<template>
  <v-tooltip :text="copyIncludesHeaders ? 'Headers included in copy' : 'Headers excluded from copy'">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        size="small"
        tile
        m-0
        :icon="copyIncludesHeaders ? 'mdi-table-headers-eye' : 'mdi-table-headers-eye-off'"
        :="tooltipProps"
        @click="copyIncludesHeaders = !copyIncludesHeaders"
      />
    </template>
  </v-tooltip>
</template>
