<script setup lang="ts">
import type { DatasetTruncation } from "@/models/dataset/DatasetTruncation";
import type { Resource } from "@esposter/db-schema";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getDatasetTruncation } from "@/services/dataset/getDatasetTruncation";
import { getDatasetTruncationText } from "@/services/dataset/getDatasetTruncationText";
import { datasetToDataSource } from "@/services/resource/sheet/dataSource/datasetToDataSource";
import { useAlertStore } from "@/store/alert";
import { MAX_READ_LIMIT, withFinalizerAsync } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const setDataSource = useSetDataSource();
const { checkIsPending, executeMutation, executeQuery } = useMutation();
const isOpen = defineModel<boolean>({ default: false });
const surveys = ref<Resource[]>();
const readError = ref("");
const selectedSurveyId = ref("");
const getImportTruncationMessage = (truncation: DatasetTruncation) =>
  `${getDatasetTruncationText(truncation)} — the remaining ${truncation.hiddenRows} were not imported`;
const readSurveys = () =>
  executeQuery(() => $trpc.survey.readResources.query({ limit: MAX_READ_LIMIT }), {
    isExclusive: true,
    key: "survey/readResources",
    onError: (error) => {
      readError.value = error.message;
    },
    onSuccess: ({ items }) => {
      readError.value = "";
      surveys.value = items;
    },
  });

watch(isOpen, async (newIsOpen) => {
  if (!newIsOpen) return;
  await readSurveys();
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
                const survey = surveys?.find(({ id }) => id === selectedSurveyId);
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
    <p>Replaces the sheet with a survey's responses, one row each. Undo brings the sheet back.</p>
    <!-- The surveys are a read: the field's own shape until it settles, then the reason it failed, the reader's
      surveys, or a line on where one comes from -->
    <UiSkeleton v-if="!surveys && checkIsPending('survey/readResources')" h-8 />
    <UiErrorState v-else-if="readError" :error="readError" @retry="readSurveys()" />
    <UiEmptyState
      v-else-if="surveys?.length === 0"
      description="Create a survey and collect responses to import them here"
      :meaning="UiIconMeaning.Survey"
      title="No surveys yet"
    />
    <UiSelect
      v-else-if="surveys"
      v-model="selectedSurveyId"
      :items="surveys.map(({ id, name }) => ({ meaning: UiIconMeaning.Survey, title: name, value: id }))"
      label="Survey"
    />
  </StyledDialog>
</template>
