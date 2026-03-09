<script setup lang="ts">
import { downloadJsonFile } from "@/services/file/downloadJsonFile";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
const { tableEditor, tableEditorType } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-tooltip text="Export configuration">
    <template #activator="{ props }">
      <v-btn
        variant="elevated"
        :flat="false"
        :="props"
        @click="downloadJsonFile(tableEditorType, tableEditor.toJSON())"
      >
        <v-icon icon="mdi-download" />
      </v-btn>
    </template>
  </v-tooltip>
</template>
