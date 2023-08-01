<script setup lang="ts">
import { useSurveyerStore } from "@/store/surveyer";
import "survey-core/defaultV2.min.css";
import "survey-creator-core/survey-creator-core.min.css";
import { SurveyCreator } from "survey-creator-knockout";

definePageMeta({ middleware: "surveyer" });

const route = useRoute();
const surveyerStore = useSurveyerStore();
const { save } = surveyerStore;
const { surveyerConfiguration } = storeToRefs(surveyerStore);
const surveyCreatorId = "surveyCreator";

onMounted(() => {
  if (!(typeof route.params.id === "string" && uuidValidateV4(route.params.id)))
    throw createError({ statusCode: 404, statusMessage: "Survey id is invalid" });

  const creator = new SurveyCreator({
    showLogicTab: true,
    isAutoSave: true,
  });
  const surveyConfiguration = surveyerConfiguration.value?.find((s) => s.id === route.params.id);
  if (!surveyConfiguration) throw createError({ statusCode: 404, statusMessage: "Survey could not be found" });

  creator.text = JSON.stringify(surveyConfiguration.surveyModel);
  creator.saveSurveyFunc = (saveNo: number, callback: Function) => {
    save();
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
