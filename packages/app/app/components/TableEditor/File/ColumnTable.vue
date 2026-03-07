<script setup lang="ts">
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { ColumnHeaders } from "@/services/tableEditor/file/ColumnHeaders";
import { useFileTableEditorStore } from "@/store/tableEditor/file";

const fileTableEditorStore = useFileTableEditorStore();
const { dataSource } = storeToRefs(fileTableEditorStore);
</script>

<template>
  <v-data-table
    v-if="dataSource"
    :headers="ColumnHeaders"
    :items="dataSource.columns"
    density="compact"
    hide-default-footer
  >
    <template #[`item.type`]="{ item: column }">
      <v-chip :color="column.type === ColumnType.String ? undefined : 'primary'" label size="small">
        {{ column.type }}
      </v-chip>
    </template>
  </v-data-table>
</template>
