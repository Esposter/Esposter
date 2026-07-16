<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { useRowDialogStore } from "@/store/resource/sheet/rowDialog";

interface ActionSlotProps {
  index: number;
  row: DataSource["rows"][number];
}

const { index, row } = defineProps<ActionSlotProps>();
const rowDialogStore = useRowDialogStore();
const { deletingId, editingId } = storeToRefs(rowDialogStore);
const editTitle = computed(() => `Edit Row ${index + 1}`);
const deleteTitle = computed(() => `Delete Row ${index + 1}`);
</script>

<template>
  <div flex>
    <ResourceSheetRowCopyToClipboardButton :row-ids="[row.id]" />
    <StyledTooltipIconButton
      :button-props="{ class: 'm-0', size: 'small', tile: true }"
      icon="mdi-pencil"
      :text="editTitle"
      @click.stop="editingId = row.id"
    />
    <StyledTooltipIconButton
      :button-props="{ class: 'm-0', size: 'small', tile: true }"
      icon="mdi-delete"
      :text="deleteTitle"
      @click.stop="deletingId = row.id"
    />
  </div>
</template>
