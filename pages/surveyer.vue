<script setup lang="ts">
import { SURVEYER_STORE } from "@/services/surveyer/constants";
import "survey-core/defaultV2.min.css";
import "survey-creator-core/survey-creator-core.min.css";
import { SurveyCreator } from "survey-creator-knockout";

const surveyCreatorId = "surveyCreator";

onMounted(() => {
  const creator = new SurveyCreator({
    showLogicTab: true,
    isAutoSave: true,
  });
  creator.text = localStorage.getItem(SURVEYER_STORE) ?? "";
  creator.saveSurveyFunc = (saveNo: number, callback: Function) => {
    localStorage.setItem(SURVEYER_STORE, creator.text);
    callback(saveNo, true);
  };
  creator.render(surveyCreatorId);
});
</script>

<template>
  <NuxtLayout>
    <div :id="surveyCreatorId" />
  </NuxtLayout>
</template>

<style scoped lang="scss">
#surveyCreator {
  /* Esposter App Bar 56px */
  height: calc(100dvh - 56px);
  width: 100%;
}
</style>
