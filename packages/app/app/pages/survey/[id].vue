<script setup lang="ts">
import type { SurveyResponseEntity } from "#shared/models/db/survey/SurveyResponseEntity";

import { validate } from "@/services/router/validate";
import { SURVEY_RESPONSE_ID_LOCAL_STORAGE_KEY } from "@/services/surveyer/constants";
import { Model } from "survey-core";
import { SurveyComponent } from "survey-vue3-ui";

definePageMeta({ validate });

let surveyResponse: null | SurveyResponseEntity = null;

const saveSurveyResponse = async (survey: Model) => {
  const model = survey.data;
  model.pageNo = survey.currentPageNo;
  if (!surveyResponse) {
    const newSurveyResponseId = crypto.randomUUID();
    surveyResponse = await $trpc.survey.createSurveyResponse.mutate({
      model,
      partitionKey: surveyId,
      rowKey: newSurveyResponseId,
    });
    localStorage.setItem(SURVEY_RESPONSE_ID_LOCAL_STORAGE_KEY, surveyResponse.rowKey);
    return;
  }

  surveyResponse = await $trpc.survey.updateSurveyResponse.mutate({
    model,
    modelVersion: surveyResponse.modelVersion,
    partitionKey: surveyResponse.partitionKey,
    rowKey: surveyResponse.rowKey,
  });
};

const route = useRoute();
const surveyId = route.params.id as string;
const { $trpc } = useNuxtApp();
const surveyModel = await $trpc.survey.readSurveyModel.query(surveyId);
const model = new Model(surveyModel);
model.onValueChanged.add(saveSurveyResponse);
model.onCurrentPageChanged.add(saveSurveyResponse);
model.onComplete.add(async (survey, { showSaveError, showSaveInProgress, showSaveSuccess }) => {
  showSaveInProgress();
  survey.clearIncorrectValues(true);

  try {
    await saveSurveyResponse(survey);
    showSaveSuccess();
  } catch {
    showSaveError();
  }
});

const isLoading = ref(true);
const onMount = async () => {
  const surveyResponseId = localStorage.getItem(SURVEY_RESPONSE_ID_LOCAL_STORAGE_KEY);
  if (!surveyResponseId) return;

  surveyResponse = await $trpc.survey.readSurveyResponse.query({ partitionKey: surveyId, rowKey: surveyResponseId });
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
  <NuxtLayout>
    <SurveyComponent v-if="!isLoading" :model />
  </NuxtLayout>
</template>
