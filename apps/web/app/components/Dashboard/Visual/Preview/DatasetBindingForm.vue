<script setup lang="ts">
import type { VisualDatasetBinding } from "#shared/models/dashboard/data/VisualDatasetBinding";

import { DatasetAggregationType, DatasetAggregationTypes } from "#shared/models/dataset/DatasetAggregationType";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { authClient } from "@/services/auth/authClient";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useAlertStore } from "@/store/alert";

const modelValue = defineModel<undefined | VisualDatasetBinding>({ required: true });
const { $trpc } = useNuxtApp();
const session = authClient.useSession();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const { dataset } = useDataset(() => modelValue.value?.reference);
// Picking a source reads it before binding it, so the reads race: latest-wins on one key, so a slow read of a source
// Picked earlier cannot land last and bind that source over the one on screen — and clearing supersedes it too
const { executeQuery, supersedeKey } = useMutation();
const readBindingKey = Symbol("readBindingDataset");
const columnItems = computed(
  () => dataset.value?.columns.map(({ name }) => ({ meaning: UiIconMeaning.Columns, title: name, value: name })) ?? [],
);
const aggregationItems = DatasetAggregationTypes.map((value) => ({
  meaning: UiIconMeaning.Aggregate,
  title: value,
  value,
}));
</script>

<template>
  <template v-if="session.data">
    <DatasetReferencePicker
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
      <div v-for="(series, index) of modelValue.query.series" :key="index" flex flex-wrap gap-2 items-end>
        <div flex flex-col gap-1 w-64>
          <span text-sm text-muted>Series column</span>
          <UiSelect v-model="series.column" :items="columnItems" label="Series column" />
        </div>
        <div flex flex-col gap-1 w-48>
          <span text-sm text-muted>Aggregation</span>
          <UiSelect v-model="series.aggregation" :items="aggregationItems" label="Aggregation" />
        </div>
        <UiIconButton
          :disabled="modelValue.query.series.length === 1"
          label="Remove series"
          :meaning="UiIconMeaning.Delete"
          :variant="UiButtonVariant.Quiet"
          @click="modelValue.query.series = modelValue.query.series.toSpliced(index, 1)"
        />
      </div>
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
