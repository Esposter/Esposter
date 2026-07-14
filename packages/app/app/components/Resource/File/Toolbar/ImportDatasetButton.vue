<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { authClient } from "@/services/auth/authClient";
import { datasetToDataSource } from "@/services/resource/file/dataSource/datasetToDataSource";
import { useAlertStore } from "@/store/alert";
import { getResultAsync, MAX_READ_LIMIT, noop, withFinalizerAsync } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const session = authClient.useSession();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const setDataSource = useSetDataSource();
const dialog = ref(false);
const surveys = ref<Resource[]>([]);
const selectedSurveyId = ref<string>();

watch(dialog, async (newDialog) => {
  if (!newDialog) return;
  await getResultAsync(async () => {
    ({ items: surveys.value } = await $trpc.survey.readResources.query({ limit: MAX_READ_LIMIT }));
  }).match(noop, (error) => createAlert(error.message, "error"));
});
</script>

<template>
  <template v-if="session.data">
    <StyledTooltipIconButton icon="mdi-poll" text="Import survey responses" @click="dialog = true" />
    <StyledDialog
      v-model="dialog"
      :card-props="{ title: 'Import survey responses' }"
      :confirm-button-props="{ disabled: !selectedSurveyId, text: 'Import' }"
      @confirm="
        (onComplete) =>
          withFinalizerAsync(
            () =>
              getResultAsync(async () => {
                const survey = surveys.find(({ id }) => id === selectedSurveyId);
                if (!survey) return;
                const dataset = await $trpc.dataset.readDataset.query({
                  id: survey.id,
                  type: DatasetProviderType.SurveyResponses,
                });
                await setDataSource(datasetToDataSource(dataset, DatasetProviderType.SurveyResponses, survey.name));
              }).match(noop, (error) => createAlert(error.message, 'error')),
            () => onComplete(),
          )
      "
    >
      <v-select v-model="selectedSurveyId" item-title="name" item-value="id" label="Survey" :items="surveys" />
    </StyledDialog>
  </template>
</template>
