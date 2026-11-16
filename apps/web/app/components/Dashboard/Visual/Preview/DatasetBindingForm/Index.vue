<script setup lang="ts">
import type { VisualDatasetBinding } from "#shared/models/dashboard/data/VisualDatasetBinding";

import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { authClient } from "#src/services/auth/authClient";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useAlertStore } from "#src/store/alert";

const modelValue = defineModel<undefined | VisualDatasetBinding>({ required: true });
const { $trpc } = useNuxtApp();
const session = authClient.useSession();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const { dataset, error } = useDataset(() => modelValue.value?.reference);
// Picking a source reads it before binding it, so the reads race: latest-wins on one key, so a slow read of a source
// Picked earlier cannot land last and bind that source over the one on screen — and clearing supersedes it too
const { executeQuery, supersedeKey } = useMutation();
const readBindingKey = Symbol("readBindingDataset");
const columnItems = computed(
  () => dataset.value?.columns.map(({ name }) => ({ meaning: UiIconMeaning.Columns, title: name, value: name })) ?? [],
);
</script>

<template>
  <template v-if="session.data">
    <DatasetReferencePicker
      :error
      :model-value="modelValue?.reference"
      @update:model-value="
        async (newReference) => {
          if (!newReference) {
            supersedeKey(readBindingKey);
            modelValue = undefined;
            return;
          }

          await executeQuery(() => $trpc.dataset.readDataset.query(newReference), {
            key: readBindingKey,
            onError: createErrorAlert,
            onSuccess: (newDataset) => {
              const firstColumn = newDataset.columns[0];
              if (!firstColumn) {
                createAlert('Source has no columns to bind', 'error');
                return;
              }

              modelValue = {
                query: {
                  series: [{ aggregation: DatasetAggregationType.Count, column: firstColumn.name }],
                  xColumn: firstColumn.name,
                },
                reference: newReference,
              };
            },
          });
        }
      "
    />
    <template v-if="modelValue">
      <div flex flex-col gap-1 w-64>
        <span text-sm text-muted>X column</span>
        <UiSelect v-model="modelValue.query.xColumn" :items="columnItems" label="X column" />
      </div>
      <!-- A row edits its series in place, so the bound query holds each change without a write back -->
      <DashboardVisualPreviewDatasetBindingFormSeries
        v-for="(series, index) of modelValue.query.series"
        :key="index"
        :model-value="series"
        :column-items
        :is-only="modelValue.query.series.length === 1"
        @remove="modelValue.query.series = modelValue.query.series.toSpliced(index, 1)"
      />
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
    </template>
  </template>
</template>
