<script setup lang="ts">
import type { DatasetTruncation } from "#shared/models/dataset/DatasetTruncation";
import type { Resource } from "@esposter/db-schema";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { getDatasetTruncation } from "#shared/services/dataset/getDatasetTruncation";
import { getDatasetTruncationText } from "#shared/services/dataset/getDatasetTruncationText";
import { authClient } from "@/services/auth/authClient";
import { datasetToDataSource } from "@/services/resource/sheet/dataSource/datasetToDataSource";
import { useAlertStore } from "@/store/alert";
import { MAX_READ_LIMIT, withFinalizerAsync } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const session = authClient.useSession();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const setDataSource = useSetDataSource();
const { executeMutation, executeQuery } = useMutation();
const dialog = ref(false);
const surveys = ref<Resource[]>([]);
const selectedSurveyId = ref("");
const getImportTruncationMessage = (truncation: DatasetTruncation) =>
  `${getDatasetTruncationText(truncation)} — the remaining ${truncation.hiddenRows} were not imported`;

watch(dialog, async (newDialog) => {
  if (!newDialog) return;
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
</template>
