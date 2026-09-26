<script setup lang="ts">
import type { DatasetTruncation } from "@/models/dataset/DatasetTruncation";
import type { Resource } from "@esposter/db-schema";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { MutationStatus } from "@/models/shared/MutationStatus";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getDatasetTruncation } from "@/services/dataset/getDatasetTruncation";
import { getDatasetTruncationText } from "@/services/dataset/getDatasetTruncationText";
import { datasetToDataSource } from "@/services/resource/sheet/dataSource/datasetToDataSource";
import { useAlertStore } from "@/store/alert";
import { useResourceStore } from "@/store/resource";
import { useSheetPortableDialogStore } from "@/store/resource/sheet/portableDialog";
import { MAX_READ_LIMIT } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const resourceStore = useResourceStore();
const { currentResourceId } = storeToRefs(resourceStore);
const sheetPortableDialogStore = useSheetPortableDialogStore();
const { closeSurveyImport } = sheetPortableDialogStore;
const getDataSourceSetter = useSetDataSource();
const { checkIsPending, executeMutation, executeQuery } = useMutation();
const isOpen = defineModel<boolean>({ default: false });
const importingResourceId = ref("");
// The import an answer closes is the one on the sheet it started on, which the reader may have left by the time the
// Dataset lands
const isImportOpen = computed({
  get: () => isOpen.value,
  set: (newIsImportOpen) => {
    if (!newIsImportOpen) closeSurveyImport(importingResourceId.value);
  },
});
const { answer, isPending } = useDialogAnswer(isImportOpen);
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
  <UiDialog
    v-model="isOpen"
    :placement="UiDialogPlacement.Middle"
    title="Import survey responses"
    w="[min(32rem,90vw)]"
  >
    <div p-3 flex flex-col gap-3 min-h-0 of-y-auto>
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
    </div>
    <footer p-3 flex gap-2 justify-end>
      <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
      <UiButton
        :disabled="!selectedSurveyId"
        :is-pending
        :variant="UiButtonVariant.Accent"
        @click="
          answer(async () => {
            // The dataset is read before it is written, so the sheet it lands in is named when the import starts
            importingResourceId = currentResourceId;
            const setDataSource = getDataSourceSetter();
            const outcome = await executeMutation(
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
            );
            return outcome.status === MutationStatus.Succeeded;
          })
        "
      >
        Import
      </UiButton>
    </footer>
  </UiDialog>
</template>
