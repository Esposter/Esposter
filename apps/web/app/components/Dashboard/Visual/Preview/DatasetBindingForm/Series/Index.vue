<script setup lang="ts">
import type { DatasetQuery } from "#shared/models/dataset/DatasetQuery";
import type { UiSelectItem } from "#src/models/ui/UiSelectItem";

import { DatasetAggregationTypes } from "#shared/models/dataset/DatasetAggregationType";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

interface Props {
  columnItems: UiSelectItem<string>[];
  // The one series left is kept, so there is nothing to remove
  isOnly: boolean;
}

const series = defineModel<DatasetQuery["series"][number]>({ required: true });
defineProps<Props>();
const emit = defineEmits<{ remove: [] }>();
const aggregationItems = DatasetAggregationTypes.map((value) => ({
  meaning: UiIconMeaning.Aggregate,
  title: value,
  value,
}));
</script>

<template>
  <div flex flex-wrap gap-2 items-end>
    <div flex flex-col gap-1 w-64>
      <span text-sm text-muted>Series column</span>
      <UiSelect v-model="series.column" :items="columnItems" label="Series column" />
    </div>
    <div flex flex-col gap-1 w-48>
      <span text-sm text-muted>Aggregation</span>
      <UiSelect v-model="series.aggregation" :items="aggregationItems" label="Aggregation" />
    </div>
    <UiIconButton
      :disabled="isOnly"
      label="Remove series"
      :meaning="UiIconMeaning.Delete"
      :variant="UiButtonVariant.Quiet"
      @click="emit('remove')"
    />
  </div>
</template>
