<script setup lang="ts">
import type { ColumnItem } from "#shared/models/tableEditor/file/ColumnItem";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { useFileTableEditorStore } from "@/store/tableEditor/file";

interface EditDialogButtonProps {
  columns: ColumnItem[];
  index: number;
  row: DataSource["rows"][number];
}

const { columns, index, row } = defineProps<EditDialogButtonProps>();
const { updateRow } = useFileTableEditorStore();
const editedRow = ref({ ...row });
</script>

<template>
  <StyledDialog
    :card-props="{ title: 'Edit Row' }"
    :confirm-button-props="{ text: 'Save' }"
    @submit="
      (_event, onComplete) => {
        updateRow(index, editedRow);
        onComplete();
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Edit Row">
        <template #activator="{ props: tooltipProps }">
          <v-btn m-0 icon="mdi-pencil" size="small" tile :="tooltipProps" @click.stop="updateIsOpen(true)" />
        </template>
      </v-tooltip>
    </template>
    <v-container fluid>
      <v-row v-for="column of columns" :key="column.name">
        <v-col cols="12">
          <v-checkbox
            v-if="column.type === ColumnType.Boolean"
            v-model="editedRow[column.name]"
            :label="column.sourceName"
          />
          <v-text-field
            v-else
            v-model="editedRow[column.name]"
            :label="column.sourceName"
            :type="column.type === ColumnType.Number ? 'number' : column.type === ColumnType.Date ? 'date' : 'text'"
            density="compact"
          />
        </v-col>
      </v-row>
    </v-container>
  </StyledDialog>
</template>
