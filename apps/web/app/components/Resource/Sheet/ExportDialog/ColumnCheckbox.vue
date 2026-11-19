<script setup lang="ts">
import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ToData } from "@esposter/shared";

interface Props {
  column: ToData<Column>;
}

const selectedColumnIds = defineModel<string[]>({ required: true });
defineProps<Props>();
</script>

<template>
  <UiCheckbox
    is-label-shown
    :label="column.name"
    :model-value="selectedColumnIds.includes(column.id)"
    @update:model-value="
      (isChecked) => {
        selectedColumnIds = isChecked
          ? [...selectedColumnIds, column.id]
          : selectedColumnIds.filter((selectedColumnId) => selectedColumnId !== column.id);
      }
    "
  />
</template>
