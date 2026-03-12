<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { VForm } from "vuetify/components";

import { ColumnTypeFormSchemaWithoutNameMap } from "#shared/models/tableEditor/file/ColumnTypeFormSchemaMap";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { Vjsf } from "@koumoul/vjsf";
import deepEqual from "fast-deep-equal";

interface EditDialogButtonProps {
  column: DataSource["columns"][number];
  dataSource: DataSource;
}

const { column, dataSource } = defineProps<EditDialogButtonProps>();
const { updateColumn } = useEditedItemDataSource();
const jsonSchema = computed(() => zodToJsonSchema(ColumnTypeFormSchemaWithoutNameMap[column.type]));
const editedColumn = ref({ ...column });
const editFormRef = ref<InstanceType<typeof VForm>>();
const isEditFormValid = ref(true);
const disabled = computed(() => deepEqual(column, editedColumn.value) || !isEditFormValid.value);
const uniqueNameRule = (value: string) =>
  value === column.name || !dataSource.columns.some(({ name }) => name === value) || "Column already exists";
</script>

<template>
  <StyledDialog
    :card-props="{ title: `Edit ${column.name} Column` }"
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
      <v-tooltip text="Edit Column">
        <template #activator="{ props: tooltipProps }">
          <v-btn m-0 icon="mdi-pencil" size="small" tile :="tooltipProps" @click.stop="updateIsOpen(true)" />
        </template>
      </v-tooltip>
    </template>
    <template #prepend-actions>
      <StyledEditFormDialogErrorIcon :edit-form-ref :form-error="''" :is-edit-form-valid="isEditFormValid" />
    </template>
    <v-form ref="editFormRef" v-model="isEditFormValid">
      <v-container fluid>
        <v-text-field v-model="editedColumn.name" label="Column" :rules="[uniqueNameRule]" />
        <Vjsf v-model="editedColumn" :schema="jsonSchema" />
      </v-container>
    </v-form>
  </StyledDialog>
</template>
