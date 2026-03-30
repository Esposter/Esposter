<script setup lang="ts">
import { TableEditorTypeTableEditorSchemaMap } from "@/services/tableEditor/TableEditorTypeTableEditorSchemaMap";
import { useAlertStore } from "@/store/alert";
import { useTableEditorStore } from "@/store/tableEditor";
import { jsonDateParse } from "@esposter/shared";
import { z } from "zod";

const tableEditorStore = useTableEditorStore();
const { importConfiguration } = tableEditorStore;
const { tableEditorType } = storeToRefs(tableEditorStore);
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const importJsonFile = useImportJsonFile();
</script>

<template>
  <v-tooltip text="Import configuration">
    <template #activator="{ props }">
      <v-btn
        variant="elevated"
        :flat="false"
        :="props"
        @click="
          async () => {
            await importJsonFile(async (file) => {
              const fileText = await file.text();
              const result = TableEditorTypeTableEditorSchemaMap[tableEditorType].safeParse(jsonDateParse(fileText));
              if (!result.success) {
                createAlert(z.prettifyError(result.error), 'error');
                return;
              }
              await importConfiguration(result.data);
            });
          }
        "
      >
        <v-icon icon="mdi-upload" />
      </v-btn>
    </template>
  </v-tooltip>
</template>
