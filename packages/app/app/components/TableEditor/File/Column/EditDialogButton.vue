<script setup lang="ts">
import type { AColumn } from "#shared/models/tableEditor/file/AColumn";
import type { z } from "zod";

import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { useFileTableEditorStore } from "@/store/tableEditor/file";
import { Vjsf } from "@koumoul/vjsf";
import deepEqual from "fast-deep-equal";

interface EditDialogButtonProps {
  column: AColumn;
  schema: z.ZodObject;
}

const { column, schema } = defineProps<EditDialogButtonProps>();
const fileTableEditorStore = useFileTableEditorStore();
const { updateColumn } = fileTableEditorStore;

const editedColumn = ref({ ...column });
const jsonSchema = computed(() => zodToJsonSchema(schema));
const isUpdated = computed(() => !deepEqual(column, editedColumn.value));
</script>

<template>
  <StyledDialog
    :card-props="{ title: `Edit ${column.sourceName} Field` }"
    :confirm-button-props="{ text: 'Save & Close' }"
    :confirm-button-attrs="{ disabled: !isUpdated }"
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
