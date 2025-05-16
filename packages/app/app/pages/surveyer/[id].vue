<script setup lang="ts">
import { validate } from "@/services/router/validate";
import { useSurveyStore } from "@/store/surveyer/survey";
import { SurveyCreatorModel } from "survey-creator-core";
import { DefaultDark, SC2020 } from "survey-creator-core/themes";

defineRouteRules({ ssr: false });
definePageMeta({ middleware: "auth", validate });

const survey = reactive(await useReadSurveyFromRoute());
const surveyerStore = useSurveyStore();
const { updateSurvey } = surveyerStore;
const creator = new SurveyCreatorModel({ autoSaveEnabled: true, showTranslationTab: true });
creator.text = survey.model;
creator.saveSurveyFunc = async (saveNo: number, callback: Function) => {
  try {
    Object.assign(
      survey,
      await updateSurvey({ id: survey.id, model: creator.text, modelVersion: survey.modelVersion }, true),
    );
    callback(saveNo, true);
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
    <v-toolbar class="border-b-sm" color="surface">
      <v-toolbar-title px-4 font-bold>
        {{ survey.name }}
        <span class="text-lg">(Version: {{ survey.modelVersion }}, Publish Version: {{ survey.publishVersion }})</span>
      </v-toolbar-title>
    </v-toolbar>
    <SurveyCreatorComponent :model="creator" />
  </NuxtLayout>
</template>

<style scoped lang="scss">
:deep(.svc-creator__banner) {
  display: none;
}
</style>
