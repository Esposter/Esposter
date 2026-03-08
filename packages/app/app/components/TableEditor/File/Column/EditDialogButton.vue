<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { ColumnTypeFormSchemaMap } from "#shared/models/tableEditor/file/ColumnTypeFormSchemaMap";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { Vjsf } from "@koumoul/vjsf";
import deepEqual from "fast-deep-equal";

interface EditDialogButtonProps {
  column: DataSource["columns"][number];
}

const { column } = defineProps<EditDialogButtonProps>();
const { updateColumn } = useEditedItemDataSource();
const jsonSchema = computed(() => zodToJsonSchema(ColumnTypeFormSchemaMap[column.type]));
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
