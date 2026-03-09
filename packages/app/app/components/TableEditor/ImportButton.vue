<script setup lang="ts">
import { TableEditorTypeTableEditorSchemaMap } from "@/services/tableEditor/TableEditorTypeTableEditorSchemaMap";
import { useAlertStore } from "@/store/alert";
import { useTableEditorStore } from "@/store/tableEditor";
import { jsonDateParse } from "@esposter/shared";
import { showOpenFilePicker } from "show-open-file-picker";

const tableEditorStore = useTableEditorStore();
const { importConfiguration } = tableEditorStore;
const { tableEditorType } = storeToRefs(tableEditorStore);
const alertStore = useAlertStore();
const { createAlert } = alertStore;
</script>

<template>
  <v-tooltip text="Import configuration">
    <template #activator="{ props }">
      <v-btn
        icon="mdi-import"
        variant="elevated"
        :flat="false"
        :="props"
        @click="
          async () => {
            const [handle] = await showOpenFilePicker({ types: [{ accept: { 'application/json': ['.json'] } }] });
            if (!handle) return;
            const file = await handle.getFile();
            const fileText = await file.text();
            try {
              const result = TableEditorTypeTableEditorSchemaMap[tableEditorType].safeParse(jsonDateParse(fileText));
              if (!result.success) {
                createAlert('Invalid configuration file.', 'error');
                return;
              }
              await importConfiguration(result.data);
            } catch {
              createAlert('Failed to read file.', 'error');
            }
          }
        "
      />
    </template>
  </v-tooltip>
</template>
