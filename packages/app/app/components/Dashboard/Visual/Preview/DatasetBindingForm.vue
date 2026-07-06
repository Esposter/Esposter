<script setup lang="ts">
import type { VisualDatasetBinding } from "#shared/models/dashboard/data/VisualDatasetBinding";
import type { Survey } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { authClient } from "@/services/auth/authClient";
import { useAlertStore } from "@/store/alert";
import { getResultAsync, takeOne } from "@esposter/shared";

const modelValue = defineModel<undefined | VisualDatasetBinding>({ required: true });
const { $trpc } = useNuxtApp();
const session = authClient.useSession();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const surveys = ref<Except<Survey, "model">[]>([]);
const { dataset } = useDataset(() => modelValue.value?.reference);
const columnNames = computed(() => dataset.value?.columns.map(({ name }) => name) ?? []);
const firstSeries = computed(() => (modelValue.value ? takeOne(modelValue.value.query.series) : undefined));

watch(
  () => session.value.data,
  async (newSession) => {
    if (!newSession) return;
    await getResultAsync(async () => {
      ({ items: surveys.value } = await $trpc.survey.readSurveys.query({}));
    }).orTee((error) => createAlert(error.message, "error"));
  },
  { immediate: true },
);
</script>

<template>
  <template v-if="session.data">
    <v-select
      clearable
      item-title="name"
      item-value="id"
      label="Survey responses"
      :items="surveys"
      :model-value="modelValue?.reference.id"
      @update:model-value="
        async (newSurveyId) => {
          if (!newSurveyId) {
            modelValue = undefined;
            return;
          }

          await getResultAsync(async () => {
            const newDataset = await $trpc.dataset.readDataset.query({
              id: newSurveyId,
              type: DatasetProviderType.SurveyResponses,
            });
            const firstColumn = newDataset.columns[0];
            if (!firstColumn) {
              createAlert('Survey has no questions to bind', 'error');
              return;
            }

            modelValue = {
              query: {
                series: [{ aggregation: DatasetAggregationType.Count, column: firstColumn.name }],
                xColumn: firstColumn.name,
              },
              reference: { id: newSurveyId, type: DatasetProviderType.SurveyResponses },
            };
          }).orTee((error) => createAlert(error.message, 'error'));
        }
      "
    />
    <template v-if="modelValue && firstSeries">
      <v-select v-model="modelValue.query.xColumn" label="X Column" :items="columnNames" />
      <v-select v-model="firstSeries.column" label="Series Column" :items="columnNames" />
      <v-select v-model="firstSeries.aggregation" label="Aggregation" :items="Object.values(DatasetAggregationType)" />
    </template>
  </template>
</template>
