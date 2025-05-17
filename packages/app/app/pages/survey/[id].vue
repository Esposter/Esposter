<script setup lang="ts">
import { validate } from "@/services/router/validate";
import { Model } from "survey-core";
import { SurveyComponent } from "survey-vue3-ui";

definePageMeta({ validate });

const route = useRoute();
const surveyId = route.params.id as string;
const { $trpc } = useNuxtApp();
const surveyModelSasUrl = await $trpc.survey.generateSurveyModelSasUrl.query(surveyId);
const surveyModel = await $fetch<string>(surveyModelSasUrl);
const model = new Model(surveyModel);
model.onComplete.add(async (survey, { showSaveError, showSaveInProgress, showSaveSuccess }) => {
  showSaveInProgress();
  survey.clearIncorrectValues(true);

  try {
    await $trpc.survey.createSurveyResponse.mutate({
      model: survey.data,
      partitionKey: surveyId,
      rowKey: crypto.randomUUID(),
    });
    showSaveSuccess();
  } catch {
    showSaveError();
  }
});
</script>

<template>
  <NuxtLayout>
    <SurveyComponent :model />
  </NuxtLayout>
</template>
