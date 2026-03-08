<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/Column";

import { columnSchema } from "#shared/models/tableEditor/file/Column";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { useFileTableEditorStore } from "@/store/tableEditor/file";
import { Vjsf } from "@koumoul/vjsf";
import deepEqual from "fast-deep-equal";

interface EditDialogButtonProps {
  column: Column;
}

const { column } = defineProps<EditDialogButtonProps>();
const fileTableEditorStore = useFileTableEditorStore();
const { updateColumn } = fileTableEditorStore;
const jsonSchema = zodToJsonSchema(columnSchema);
const editedColumn = ref({ ...column });
const disabled = computed(() => deepEqual(column, editedColumn.value));
</script>

<template>
  <StyledDialog
    :card-props="{ title: `Edit ${column.sourceName} Field` }"
    :confirm-button-props="{ text: 'Save & Close' }"
    :confirm-button-attrs="{ disabled }"
    @submit="
      (_event, onComplete) => {
        updateColumn(column.name, editedColumn);
        onComplete();
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Edit Field">
        <template #activator="{ props: tooltipProps }">
          <v-btn m-0 icon="mdi-pencil" size="small" tile :="tooltipProps" @click.stop="updateIsOpen(true)" />
        </template>
      </v-tooltip>
    </template>
    <v-container fluid>
      <Vjsf v-model="editedColumn" :schema="jsonSchema" />
    </v-container>
  </StyledDialog>
</template>
