<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { ColumnTypeFormSchemaWithoutNameMap } from "#shared/models/tableEditor/file/ColumnTypeFormSchemaMap";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { Vjsf } from "@koumoul/vjsf";
import deepEqual from "fast-deep-equal";

interface EditDialogButtonProps {
  column: DataSource["columns"][number];
}

const { column } = defineProps<EditDialogButtonProps>();
const { dataSource, updateColumn } = useEditedItemDataSource();
const jsonSchema = computed(() => zodToJsonSchema(ColumnTypeFormSchemaWithoutNameMap[column.type]));
const editedColumn = ref({ ...column });
const isValid = ref(true);
const disabled = computed(() => deepEqual(column, editedColumn.value) || !isValid.value);
const uniqueNameRule = (value: string) =>
  value === column.name ||
  !(dataSource.value?.columns.some(({ name }) => name === value) ?? false) ||
  "Field name already exists";
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
      <v-form v-model="isValid">
        <v-text-field v-model="editedColumn.name" label="Field" :rules="[uniqueNameRule]" />
        <Vjsf v-model="editedColumn" :schema="jsonSchema" />
      </v-form>
    </v-container>
  </StyledDialog>
</template>
