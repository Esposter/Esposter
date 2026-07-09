<script setup lang="ts">
import type { VisualDatasetBinding } from "#shared/models/dashboard/data/VisualDatasetBinding";

import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { authClient } from "@/services/auth/authClient";
import { useAlertStore } from "@/store/alert";
import { getResultAsync, noop } from "@esposter/shared";

const modelValue = defineModel<undefined | VisualDatasetBinding>({ required: true });
const { $trpc } = useNuxtApp();
const session = authClient.useSession();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const { dataset } = useDataset(() => modelValue.value?.reference);
const columnNames = computed(() => dataset.value?.columns.map(({ name }) => name) ?? []);
const datasetAggregationTypes = Object.values(DatasetAggregationType);
</script>

<template>
  <template v-if="session.data">
    <DatasetReferencePicker
      :model-value="modelValue?.reference"
      @update:model-value="
        async (newReference) => {
          if (!newReference) {
            modelValue = undefined;
            return;
          }

          await getResultAsync(async () => {
            const newDataset = await $trpc.dataset.readDataset.query(newReference);
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
          }).match(noop, (error) => createAlert(error.message, 'error'));
        }
      "
    />
    <template v-if="modelValue">
      <v-select v-model="modelValue.query.xColumn" :items="columnNames" label="X Column" />
      <div v-for="(series, index) of modelValue.query.series" :key="index" flex gap-2 items-center>
        <v-select v-model="series.column" :items="columnNames" label="Series Column" />
        <v-select v-model="series.aggregation" :items="datasetAggregationTypes" label="Aggregation" />
        <StyledTooltipIconButton
          :button-props="{ disabled: modelValue.query.series.length === 1 }"
          icon="mdi-delete"
          text="Remove series"
          @click="modelValue.query.series.splice(index, 1)"
        />
      </div>
      <StyledTooltipIconButton
        icon="mdi-plus"
        text="Add series"
        @click="
          modelValue.query.series.push({ aggregation: DatasetAggregationType.Count, column: modelValue.query.xColumn })
        "
      />
    </template>
  </template>
</template>
