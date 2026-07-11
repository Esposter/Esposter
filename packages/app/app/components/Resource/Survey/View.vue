<script setup lang="ts">
import type { SurveyResponseEntity } from "@esposter/db-schema";

import { parseSurveyModel } from "#shared/services/survey/parseSurveyModel";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { THEME_KEY } from "@/services/survey/constants";
import { getResultAsync } from "@esposter/shared";
import { Model } from "survey-core";
import { SurveyComponent } from "survey-vue3-ui";

interface ResourceSurveyViewProps {
  id: string;
}

const { id } = defineProps<ResourceSurveyViewProps>();
const { $trpc } = useNuxtApp();

let surveyResponse: null | SurveyResponseEntity = null;

const saveSurveyResponse = async (survey: Model) => {
  const responseModel = survey.data;
  responseModel.pageNo = survey.currentPageNo;
  if (!surveyResponse) {
    const newSurveyResponseId = crypto.randomUUID();
    surveyResponse = await $trpc.survey.createSurveyResponse.mutate({
      model: responseModel,
      partitionKey: id,
      rowKey: newSurveyResponseId,
    });
    localStorage.setItem(LocalStorageKey.SurveyResponseId(id), surveyResponse.rowKey);
    return;
  }

  surveyResponse = await $trpc.survey.updateSurveyResponse.mutate({
    model: responseModel,
    modelVersion: surveyResponse.modelVersion,
    partitionKey: surveyResponse.partitionKey,
    rowKey: surveyResponse.rowKey,
  });
};

const { content, name } = await getResultAsync(() => $trpc.survey.readPublishedResourceContent.query(id)).match(
  (publishedResource) => publishedResource,
  () => {
    throw createError({ statusCode: 404, statusMessage: "Survey not found" });
  },
);
const { [THEME_KEY]: theme, ...surveyModel } = parseSurveyModel(content.model);
const model = new Model(surveyModel);
if (theme) model.applyTheme(theme);
model.onValueChanged.add(saveSurveyResponse);
model.onCurrentPageChanged.add(saveSurveyResponse);
model.onComplete.add(async (survey, { showSaveError, showSaveInProgress, showSaveSuccess }) => {
  showSaveInProgress();
  survey.clearIncorrectValues(true);
  await getResultAsync(() => saveSurveyResponse(survey)).match(
    () => {
      // The resume id must not outlive the submission — a shared device could otherwise reopen the answers
      localStorage.removeItem(LocalStorageKey.SurveyResponseId(id));
      showSaveSuccess();
    },
    (error) => showSaveError(error.message),
  );
});
useSeoMeta({ ogTitle: name, ogUrl: useRequestURL().href, title: name });

const isLoading = ref(true);
// Respondent progress is tracked per browser, so an interrupted survey resumes where it left off
const onMount = async () => {
  const surveyResponseId = localStorage.getItem(LocalStorageKey.SurveyResponseId(id));
  if (!surveyResponseId) return;

  surveyResponse = await $trpc.survey.readSurveyResponse.query({ partitionKey: id, rowKey: surveyResponseId });
  if (!surveyResponse) return;

  model.data = surveyResponse.model;
  if (!surveyResponse.model.pageNo) return;
  model.currentPageNo = surveyResponse.model.pageNo as number;
};

onMounted(async () => {
  await onMount();
  isLoading.value = false;
});
</script>

<template>
  <SurveyComponent v-if="!isLoading" :model />
</template>
