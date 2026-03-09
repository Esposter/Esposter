<script setup lang="ts">
import { TableEditorTypeTableEditorSchemaMap } from "@/services/tableEditor/TableEditorTypeTableEditorSchemaMap";
import { useAlertStore } from "@/store/alert";
import { useTableEditorStore } from "@/store/tableEditor";
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
            try {
              const result = TableEditorTypeTableEditorSchemaMap[tableEditorType].safeParse(JSON.parse(await file.text()));
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
