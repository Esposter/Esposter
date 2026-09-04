<script setup lang="ts">
import type { Column } from "#shared/models/resource/sheet/column/Column";

import { ChartableColumnTypes } from "@/services/resource/sheet/column/computeColumnChartData";
import { getEffectiveColumnType } from "@/services/resource/sheet/column/getEffectiveColumnType";
import { getDeleteColumnDescription } from "@/services/resource/sheet/commands/getDeleteColumnDescription";
import { getEditColumnDescription } from "@/services/resource/sheet/commands/getEditColumnDescription";
import { DENSE_ICON_BUTTON_PROPS } from "@/services/shared/constants";
import { useColumnDialogStore } from "@/store/resource/sheet/columnDialog";

interface Props {
  column: Column;
}

const { column } = defineProps<Props>();
const columnDialogStore = useColumnDialogStore();
const { chartingColumnName, deletingColumnName, editingColumnName } = storeToRefs(columnDialogStore);
</script>

<template>
  <div flex>
    <StyledTooltipIconButton
      v-if="ChartableColumnTypes.has(getEffectiveColumnType(column))"
      :button-props="DENSE_ICON_BUTTON_PROPS"
      icon="mdi-chart-bar"
      text="Column Chart"
      @click.stop="chartingColumnName = column.name"
    />
    <ResourceSheetColumnToggleVisibilityButton
      :column-id="column.id"
      :column-name="column.name"
      :is-hidden="column.isHidden"
    />
    <StyledTooltipIconButton
      :button-props="DENSE_ICON_BUTTON_PROPS"
      icon="mdi-pencil"
      :text="getEditColumnDescription(column.name)"
      @click.stop="editingColumnName = column.name"
    />
    <StyledTooltipIconButton
      :button-props="DENSE_ICON_BUTTON_PROPS"
      icon="mdi-delete"
      :text="getDeleteColumnDescription(column.name)"
      @click.stop="deletingColumnName = column.name"
    />
  </div>
</template>
