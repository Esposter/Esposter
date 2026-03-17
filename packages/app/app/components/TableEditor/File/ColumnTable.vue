<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { ColumnHeaders } from "@/services/tableEditor/file/column/ColumnHeaders";
import { ColumnTypeColorMap } from "@/services/tableEditor/file/column/ColumnTypeColorMap";
import { DRAG_HANDLE_CLASS } from "@/services/tableEditor/file/constants";
import { getToggleColumnVisibilityDescription } from "@/services/tableEditor/file/commands/getToggleColumnVisibilityDescription";
import { takeOne } from "@esposter/shared";
import { VueDraggable } from "vue-draggable-plus";

interface ColumnTableProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<ColumnTableProps>();
const deleteColumns = useDeleteColumns();
const reorderColumns = useReorderColumns();
const toggleColumnVisibility = useToggleColumnVisibility();
const selectedColumnIds = ref<string[]>([]);
const dragColumns = computed({
  get: () => dataSource.columns,
  set: reorderColumns,
});
</script>

<template>
  <VueDraggable v-model="dragColumns" target="tbody" :handle="`.${DRAG_HANDLE_CLASS}`">
    <StyledDataTable
      :data-table-props="{
        density: 'compact',
        headers: ColumnHeaders,
        hideDefaultFooter: true,
        items: dragColumns,
        modelValue: selectedColumnIds,
        showSelect: true,
        'onUpdate:modelValue': (newSelectedIds) => {
          selectedColumnIds = newSelectedIds as string[];
        },
      }"
    >
      <template v-if="selectedColumnIds.length > 0" #top>
        <v-toolbar>
          <v-toolbar-title pl-3>
            {{ selectedColumnIds.length }} column{{ selectedColumnIds.length === 1 ? "" : "s" }} selected
          </v-toolbar-title>
          <StyledConfirmDeleteDialogButton
            :card-props="{
              title: `Delete ${selectedColumnIds.length} Column${selectedColumnIds.length === 1 ? '' : 's'}`,
              text: `Are you sure you want to delete ${selectedColumnIds.length} selected column${selectedColumnIds.length === 1 ? '' : 's'}?`,
            }"
            @delete="
              (onComplete) => {
                deleteColumns(selectedColumnIds);
                selectedColumnIds = [];
                onComplete();
              }
            "
          />
        </v-toolbar>
      </template>
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
    </StyledDataTable>
  </VueDraggable>
</template>
