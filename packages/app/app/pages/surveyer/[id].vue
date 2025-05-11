<script setup lang="ts">
import { validate } from "@/services/router/validate";
import { useSurveyStore } from "@/store/surveyer/survey";
import "survey-core/survey-core.min.css";
import "survey-core/survey.i18n";
import { SurveyCreatorModel } from "survey-creator-core";
import "survey-creator-core/survey-creator-core.i18n";
import "survey-creator-core/survey-creator-core.min.css";
import { DefaultDark, SC2020 } from "survey-creator-core/themes";

defineRouteRules({ ssr: false });
definePageMeta({ middleware: "auth", validate });

const survey = await useReadSurveyFromRoute();
const surveyerStore = useSurveyStore();
const { updateSurvey } = surveyerStore;
const creator = new SurveyCreatorModel({ autoSaveEnabled: true, showTranslationTab: true });
creator.text = survey.model;
creator.saveSurveyFunc = async (saveNo: number, callback: Function) => {
  survey.model = creator.text;

  try {
    const isSuccessful = await updateSurvey(survey);
    callback(saveNo, isSuccessful);
  } catch {
    callback(saveNo, false);
  }
};

const isDark = useIsDark();

watch(
  isDark,
  (newIsDark) => {
    if (newIsDark) creator.applyCreatorTheme(DefaultDark);
    else creator.applyCreatorTheme(SC2020);
  },
  { immediate: true },
);
</script>

<template>
  <NuxtLayout>
    <SurveyCreatorComponent :model="creator" />
  </NuxtLayout>
</template>

<style scoped lang="scss">
:deep(.svc-creator__banner) {
  display: none;
}
</style>
