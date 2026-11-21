<script setup lang="ts">
import type { DatasetTruncation } from "#shared/models/dataset/DatasetTruncation";
import type { ResourceInResource } from "@esposter/db-schema";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { getDatasetTruncation } from "#shared/services/dataset/getDatasetTruncation";
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { MutationStatus } from "#src/models/shared/MutationStatus";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "#src/models/ui/UiDialogPlacement";
import { UiDialogSize } from "#src/models/ui/UiDialogSize";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getDatasetTruncationText } from "#src/services/dataset/getDatasetTruncationText";
import { datasetToDataSource } from "#src/services/resource/sheet/dataSource/datasetToDataSource";
import { useAlertStore } from "#src/store/alert";
import { useResourceStore } from "#src/store/resource/index";
import { useSheetPortableDialogStore } from "#src/store/resource/sheet/portableDialog";
import { MAX_READ_LIMIT } from "@esposter/shared";

const isOpen = defineModel<boolean>({ default: false });
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const resourceStore = useResourceStore();
const { currentResourceId } = storeToRefs(resourceStore);
const sheetPortableDialogStore = useSheetPortableDialogStore();
const { closeSurveyImport } = sheetPortableDialogStore;
const { $trpc } = useNuxtApp();
const getDataSourceSetter = useSetDataSource();
const { checkIsPending, executeMutation, executeQuery } = useMutation();
const runScope = useRunScope();
const { answer, importingResourceId, isImporting, saveResourceRevision } = useImportPreview(isOpen, closeSurveyImport);
const surveys = ref<ResourceInResource[]>();
const surveyItems = computed(() =>
  (surveys.value ?? []).map(({ id, name }) => ({ meaning: UiIconMeaning.Survey, title: name, value: id })),
);
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
      // A survey deleted since the dialog last read the list is no longer one to import, so the choice of it is dropped
      if (!items.some(({ id }) => id === selectedSurveyId.value)) selectedSurveyId.value = "";
    },
    runScope,
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
    :size="UiDialogSize.Medium"
  >
    <p>
      Replaces the sheet with a survey's responses, one row each. The sheet it replaces stays in its version history.
    </p>
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
    <UiSelect v-else-if="surveys" v-model="selectedSurveyId" :items="surveyItems" label="Survey" />
    <template #footer>
      <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
      <UiButton
        :disabled="!selectedSurveyId"
        :is-pending="isImporting"
        :variant="UiButtonVariant.Accent"
        @click="
          answer(async () => {
            // The dataset is read before it is written, so the sheet it lands in is named when the import starts
            importingResourceId = currentResourceId;
            const survey = surveys?.find(({ id }) => id === selectedSurveyId);
            // Nothing to import leaves the dialog open on the choice, rather than closing as an import that landed
            if (!survey) return false;

            const setDataSource = getDataSourceSetter();
            // A Sheet import keeps the working copy as a revision before it replaces it, and an import whose revision did
            // Not land reads nothing and leaves the sheet as it was
            if (!(await saveResourceRevision())) return false;
            const outcome = await executeMutation(
              async () => {
                const dataset = await $trpc.dataset.readDataset.query({
                  id: survey.id,
                  type: DatasetProviderType.SurveyResponses,
                });
                setDataSource(datasetToDataSource(dataset, DatasetProviderType.SurveyResponses, survey.name));
                // The sheet now looks like the whole survey, so a capped copy has to say so on the way in
                const truncation = getDatasetTruncation(dataset);
                if (truncation) createAlert(getImportTruncationMessage(truncation), 'warning');
              },
              // The rows the sheet takes are the server's, read before the sheet is written, so the import waits for them
              { awaitedBecause: AwaitedReason.ServerIssuedValue, key: selectedSurveyId },
            );
            return outcome.status === MutationStatus.Succeeded;
          }, AwaitedReason.ServerIssuedValue)
        "
      >
        Import
      </UiButton>
    </template>
  </UiDialog>
</template>
