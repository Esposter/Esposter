<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { Vjsf } from "@koumoul/vjsf";
import deepEqual from "fast-deep-equal";

interface EditDialogButtonProps {
  column: DataSource["columns"][number];
}

const { column } = defineProps<EditDialogButtonProps>();
const { updateColumn } = useEditedItemDataSource();
const jsonSchema = useColumnTypeFormJsonSchema(column);
const editedColumn = ref({ ...column });
const isValid = ref(true);
const disabled = computed(() => deepEqual(column, editedColumn.value) || !isValid.value);
</script>

<template>
  <StyledDialog
    :card-props="{ title: `Edit ${column.sourceName} Column` }"
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
    <v-container fluid>
      <v-form v-model="isValid">
        <Vjsf v-model="editedColumn" :schema="jsonSchema" />
      </v-form>
    </v-container>
  </StyledDialog>
</template>
