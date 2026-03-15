<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { ColumnHeaders } from "@/services/tableEditor/file/ColumnHeaders";
import { ColumnTypeColorMap } from "@/services/tableEditor/file/ColumnTypeColorMap";
import { DRAG_HANDLE_CLASS } from "@/services/tableEditor/file/constants";
import { getToggleColumnVisibilityDescription } from "@/services/tableEditor/file/getToggleColumnVisibilityDescription";
import { takeOne } from "@esposter/shared";
import { VueDraggable } from "vue-draggable-plus";

interface ColumnTableProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<ColumnTableProps>();
const { reorderColumns, toggleColumnVisibility } = useEditedItemDataSourceOperations();
const dragColumns = computed({
  get: () => dataSource.columns,
  set: reorderColumns,
});
</script>

<template>
  <VueDraggable v-model="dragColumns" target="tbody" :handle="`.${DRAG_HANDLE_CLASS}`">
    <v-data-table :headers="ColumnHeaders" :items="dragColumns" density="compact" hide-default-footer>
      <template #[`item.drag`]>
        <v-icon :class="DRAG_HANDLE_CLASS" icon="mdi-drag" cursor-move />
      </template>
      <template #[`item.name`]="{ item: column }">
        <div flex items-center gap-1>
          <span>{{ column.name }}</span>
          <v-tooltip v-if="column.description" :text="column.description">
            <template #activator="{ props }">
              <v-icon icon="mdi-information-outline" size="small" :="props" />
            </template>
          </v-tooltip>
        </div>
      </template>
      <template #[`item.type`]="{ item: column }">
        <v-chip :color="takeOne(ColumnTypeColorMap, column.type)" label size="small">{{ column.type }}</v-chip>
      </template>
      <template #[`item.actions`]="{ item: column }">
        <v-tooltip :text="getToggleColumnVisibilityDescription(column.name, column.hidden)">
          <template #activator="{ props }">
            <v-btn
              :icon="column.hidden ? 'mdi-eye-off' : 'mdi-eye'"
              density="compact"
              variant="text"
              :="props"
              @click="toggleColumnVisibility(column.id)"
            />
          </template>
        </v-tooltip>
        <TableEditorFileColumnEditDialogButton :data-source :column />
        <TableEditorFileColumnDeleteDialogButton :name="column.name" />
      </template>
    </v-data-table>
  </VueDraggable>
</template>
