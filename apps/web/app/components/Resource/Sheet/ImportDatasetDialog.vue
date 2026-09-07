<script setup lang="ts">
import type { DatasetTruncation } from "@/models/dataset/DatasetTruncation";
import type { Resource } from "@esposter/db-schema";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { getDatasetTruncation } from "@/services/dataset/getDatasetTruncation";
import { getDatasetTruncationText } from "@/services/dataset/getDatasetTruncationText";
import { datasetToDataSource } from "@/services/resource/sheet/dataSource/datasetToDataSource";
import { useAlertStore } from "@/store/alert";
import { MAX_READ_LIMIT, withFinalizerAsync } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const setDataSource = useSetDataSource();
const { executeMutation, executeQuery } = useMutation();
const isOpen = defineModel<boolean>({ default: false });
const surveys = ref<Resource[]>([]);
const selectedSurveyId = ref("");
const getImportTruncationMessage = (truncation: DatasetTruncation) =>
  `${getDatasetTruncationText(truncation)} — the remaining ${truncation.hiddenRows} were not imported`;

watch(isOpen, async (newIsOpen) => {
  if (!newIsOpen) return;
  await executeQuery(() => $trpc.survey.readResources.query({ limit: MAX_READ_LIMIT }), {
    isExclusive: true,
    key: "survey/readResources",
    onSuccess: ({ items }) => {
      surveys.value = items;
    },
  });
});
</script>

<template>
  <StyledDialog
    v-model="isOpen"
    :card-props="{ title: 'Import survey responses' }"
    :confirm-button-props="{ disabled: !selectedSurveyId, text: 'Import' }"
    @confirm="
      (onComplete) =>
        withFinalizerAsync(
          () =>
            executeMutation(
              async () => {
                const survey = surveys.find(({ id }) => id === selectedSurveyId);
                if (!survey) return;
                const dataset = await $trpc.dataset.readDataset.query({
                  id: survey.id,
                  type: DatasetProviderType.SurveyResponses,
                });
                await setDataSource(datasetToDataSource(dataset, DatasetProviderType.SurveyResponses, survey.name));
                // The sheet now looks like the whole survey, so a capped copy has to say so on the way in
                const truncation = getDatasetTruncation(dataset);
                if (truncation) createAlert(getImportTruncationMessage(truncation), 'warning');
              },
              { key: selectedSurveyId },
            ),
          () => onComplete(),
        )
    "
  >
    <v-select v-model="selectedSurveyId" item-title="name" item-value="id" label="Survey" :items="surveys" />
  </StyledDialog>
</template>
