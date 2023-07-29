<script setup lang="ts">
import { SURVEYER_STORE } from "@/services/surveyer/constants";
import "survey-core/defaultV2.min.css";
import "survey-creator-core/survey-creator-core.min.css";
import { SurveyCreator } from "survey-creator-knockout";

onMounted(() => {
  const creator = new SurveyCreator({
    showLogicTab: true,
    isAutoSave: true,
  });
  creator.saveSurveyFunc = (saveNo: number, callback: Function) => {
    localStorage.setItem(SURVEYER_STORE, creator.text);
    callback(saveNo, true);
  };
  creator.render("surveyCreator");
});
</script>

<template>
  <NuxtLayout>
    <div id="surveyCreator" />
  </NuxtLayout>
</template>

<style scoped lang="scss">
#surveyCreator {
  /* Esposter App Bar 56px */
  height: calc(100dvh - 56px);
  width: 100%;
}
</style>
