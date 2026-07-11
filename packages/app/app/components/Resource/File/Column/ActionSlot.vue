<script setup lang="ts">
import type { Column } from "#shared/models/resource/file/column/Column";

import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import { useColumnDialogStore } from "@/store/resource/file/columnDialog";

interface ActionSlotProps {
  column: Column;
}

const { column } = defineProps<ActionSlotProps>();
const columnDialogStore = useColumnDialogStore();
const { chartingColumnName, deletingColumnName, editingColumnName } = storeToRefs(columnDialogStore);
const editTitle = computed(() => `Edit "${column.name}" Column`);
const deleteTitle = computed(() => `Delete "${column.name}" Column`);
</script>

<template>
  <div flex>
    <StyledTooltipIconButton
      v-if="column.type === ColumnType.Number || column.type === ColumnType.Boolean"
      :button-props="{ class: 'm-0', size: 'small', tile: true }"
      icon="mdi-chart-bar"
      text="Column Chart"
      @click.stop="chartingColumnName = column.name"
    />
    <ResourceFileColumnToggleVisibilityButton
      :column-id="column.id"
      :column-name="column.name"
      :hidden="column.hidden"
    />
    <StyledTooltipIconButton
      :button-props="{ class: 'm-0', size: 'small', tile: true }"
      icon="mdi-pencil"
      :text="editTitle"
      @click.stop="editingColumnName = column.name"
    />
    <StyledTooltipIconButton
      :button-props="{ class: 'm-0', size: 'small', tile: true }"
      icon="mdi-delete"
      :text="deleteTitle"
      @click.stop="deletingColumnName = column.name"
    />
  </div>
</template>
