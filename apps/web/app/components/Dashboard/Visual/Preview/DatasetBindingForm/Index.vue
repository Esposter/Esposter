<script setup lang="ts">
import type { VisualDatasetBinding } from "#shared/models/dashboard/data/VisualDatasetBinding";
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";

import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { authClient } from "#src/services/auth/authClient";
import { removeDatasetQuerySeries } from "#src/services/dashboard/dataset/removeDatasetQuerySeries";
import { useAlertStore } from "#src/store/alert";

const modelValue = defineModel<undefined | VisualDatasetBinding>({ required: true });
const session = authClient.useSession();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
// A pick is read by the reader that reads the bound source, and is bound from that one read once its columns land,
// So a source is read once. The reader keeps only the latest reference, so a slow read of a source picked earlier
// Cannot land last and bind over the one on screen
const pickedReference = ref<DatasetReference>();
const { dataset, error } = useDataset(() => pickedReference.value ?? modelValue.value?.reference);
const columnItems = computed(
  () => dataset.value?.columns.map(({ name }) => ({ meaning: UiIconMeaning.Columns, title: name, value: name })) ?? [],
);
watch(dataset, (newDataset) => {
  const reference = pickedReference.value;
  if (!reference) return;

  // Clearing the pick before binding keeps the reference the same, so binding it does not read the source again
  pickedReference.value = undefined;
  if (!newDataset) return;

  const firstColumn = newDataset.columns[0];
  if (!firstColumn) {
    createAlert("Source has no columns to bind", "error");
    return;
  }

  modelValue.value = {
    query: {
      series: [{ aggregation: DatasetAggregationType.Count, column: firstColumn.name }],
      xColumn: firstColumn.name,
    },
    reference,
  };
});
</script>

<template>
  <template v-if="session.data">
    <DatasetReferencePicker
      :error
      :model-value="modelValue?.reference"
      @update:model-value="
        (newReference) => {
          if (!newReference) {
            pickedReference = undefined;
            modelValue = undefined;
            return;
          }

          pickedReference = newReference;
        }
      "
    />
    <template v-if="modelValue">
      <div flex flex-col gap-1 w-64>
        <span text-muted>X column</span>
        <UiSelect v-model="modelValue.query.xColumn" :items="columnItems" label="X column" />
      </div>
      <!-- A row edits its series in place, so the bound query holds each change without a write back -->
      <!-- eslint-disable vue/no-restricted-syntax -- removes a series from the binding draft the form edits, which the store writes to the visual only once it is valid -->
      <DashboardVisualPreviewDatasetBindingFormSeries
        v-for="(series, index) of modelValue.query.series"
        :key="index"
        :model-value="series"
        :column-items
        :is-only="modelValue.query.series.length === 1"
        @remove="modelValue.query = removeDatasetQuerySeries(modelValue.query, index)"
      />
      <!-- eslint-enable vue/no-restricted-syntax -->
      <UiButton
        self-start
        @click="
          modelValue.query.series = [
            ...modelValue.query.series,
            { aggregation: DatasetAggregationType.Count, column: modelValue.query.xColumn },
          ]
        "
      >
        <UiIcon :meaning="UiIconMeaning.Create" />
        Add series
      </UiButton>
      <DashboardVisualPreviewDatasetBindingFormOrder
        v-model="modelValue.query.order"
        :series="modelValue.query.series"
      />
    </template>
  </template>
</template>
