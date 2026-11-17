<script setup lang="ts">
import type { DatasetQueryOrder } from "#shared/models/dataset/DatasetQueryOrder";
import type { DatasetQuerySeries } from "#shared/models/dataset/DatasetQuerySeries";

import { DatasetOrderDirection, DatasetOrderDirections } from "#shared/models/dataset/DatasetOrderDirection";
import { DASHBOARD_TABLE_CATEGORY_KEY } from "#src/services/dashboard/constants";

interface Props {
  series: DatasetQuerySeries[];
}

// Absent until a ranking is chosen, so the categories keep the order their rows first name them
const order = defineModel<DatasetQueryOrder | undefined>({ required: true });
const { series } = defineProps<Props>();
// The choices are the row order, the category, and each series by its place in the query
const orderByItems = computed(() => [
  { title: "Row order", value: "" },
  { title: "Category", value: DASHBOARD_TABLE_CATEGORY_KEY },
  ...series.map(({ aggregation, column }, index) => ({ title: `${aggregation} of ${column}`, value: String(index) })),
]);
const orderByValue = computed(() => {
  if (!order.value) return "";

  return order.value.seriesIndex === undefined ? DASHBOARD_TABLE_CATEGORY_KEY : String(order.value.seriesIndex);
});
const directionItems = DatasetOrderDirections.map((value) => ({ title: value, value }));
// Changing what the categories rank by keeps the direction the owner already chose
const setOrderBy = (choice: string) => {
  if (!choice) {
    order.value = undefined;
    return;
  }

  const direction = order.value?.direction ?? DatasetOrderDirection.Ascending;
  order.value = choice === DASHBOARD_TABLE_CATEGORY_KEY ? { direction } : { direction, seriesIndex: Number(choice) };
};
</script>

<template>
  <div flex flex-wrap gap-2 items-end>
    <div flex flex-col gap-1 w-64>
      <span text-sm text-muted>Order by</span>
      <UiSelect
        :items="orderByItems"
        :model-value="orderByValue"
        label="Order by"
        @update:model-value="(choice) => setOrderBy(choice)"
      />
    </div>
    <div v-if="order" flex flex-col gap-1 w-48>
      <span text-sm text-muted>Direction</span>
      <UiSelect v-model="order.direction" :items="directionItems" label="Direction" />
    </div>
  </div>
</template>
