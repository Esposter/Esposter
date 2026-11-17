<script setup lang="ts">
import type { UiTabItem } from "#src/models/ui/UiTabItem";
import type { SurveyAnswers, SurveyDocument } from "vue-survey-engine-headless";

import { getSurveyDocumentDatasetColumns } from "#shared/services/dataset/surveyResponses/getSurveyDocumentDatasetColumns";
import { toSurveyResponseDatasetRow } from "#shared/services/dataset/surveyResponses/toSurveyResponseDatasetRow";
import { SurveyPreviewResultView } from "#src/models/resource/survey/SurveyPreviewResultView";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";

interface Props {
  document: SurveyDocument;
}

const { document } = defineProps<Props>();
// The answers of a completed run. The results replace the runner, so a restart mounts a fresh one with no answers
const results = ref<SurveyAnswers>();
const view = ref<SurveyPreviewResultView>(SurveyPreviewResultView.Table);
const viewItems: UiTabItem<SurveyPreviewResultView>[] = Object.values(SurveyPreviewResultView).map((value) => ({
  title: value,
  value,
}));
// The Responses blade's columns and cell builder, so the preview shows a result the blade shows for the same answers
const columns = computed(() => getSurveyDocumentDatasetColumns(document));
const row = computed(() => results.value && toSurveyResponseDatasetRow(columns.value, results.value));
const json = computed(() => JSON.stringify(results.value, undefined, 2));
const restart = () => {
  results.value = undefined;
  view.value = SurveyPreviewResultView.Table;
};
</script>

<template>
  <ResourceSurveyRunner v-if="!results" :document @complete="(answers) => (results = answers)" />
  <div v-else flex flex-col gap-4 ui-body>
    <UiTabs v-model="view" :items="viewItems" label="How the results are shown">
      <template #default="{ value }">
        <div v-if="value === SurveyPreviewResultView.Table" of-x-auto>
          <table>
            <thead>
              <tr>
                <th v-for="{ name } of columns" :key="name" scope="col" fw-normal pr-4 text-start>{{ name }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td v-for="{ name } of columns" :key="name" pr-4 align-top>{{ row?.[name] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <pre v-else of-x-auto>{{ json }}</pre>
      </template>
    </UiTabs>
    <UiButton :variant="UiButtonVariant.Accent" @click="restart()">Preview Survey Again</UiButton>
  </div>
</template>
