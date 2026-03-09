<script setup lang="ts">
import { downloadJsonFile } from "@/services/file/downloadJsonFile";
import { useTableEditorStore } from "@/store/tableEditor";
import { toRawDeep } from "@esposter/shared";

const tableEditorStore = useTableEditorStore();
const { tableEditorConfiguration, tableEditorType } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-tooltip text="Export configuration">
    <template #activator="{ props }">
      <v-btn
        icon="mdi-export"
        variant="elevated"
        :flat="false"
        :="props"
        @click="downloadJsonFile(`${tableEditorType}-config.json`, toRawDeep(tableEditorConfiguration)[tableEditorType])"
      />
    </template>
  </v-tooltip>
</template>
