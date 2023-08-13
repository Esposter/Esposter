<script setup lang="ts">
import { useSurveyStore } from "@/store/surveyer/survey";
import "survey-core/defaultV2.min.css";
import "survey-creator-core/survey-creator-core.min.css";
import { SurveyCreator } from "survey-creator-knockout";

const { status } = useAuth();
const route = useRoute();
const surveyerStore = useSurveyStore();
const { updateSurvey, unauthedSave } = surveyerStore;
const { surveyList } = storeToRefs(surveyerStore);
const readMoreSurveys = await useReadSurveys();
const surveyCreatorId = "surveyCreator";

onMounted(() => {
  if (!(typeof route.params.id === "string" && uuidValidateV4(route.params.id)))
    throw createError({ statusCode: 404, statusMessage: "Survey id is invalid" });

  const creator = new SurveyCreator({
    showLogicTab: true,
    isAutoSave: true,
  });
  const survey = surveyList.value.find((s) => s.rowKey === route.params.id);
  if (!survey) throw createError({ statusCode: 404, statusMessage: "Survey could not be found" });

  creator.text = survey.model;
  creator.saveSurveyFunc = async (saveNo: number, callback: Function) => {
    survey.model = creator.text;
    survey.updatedAt = new Date();

    if (status.value === "authenticated") {
      try {
        await updateSurvey(survey);
        callback(saveNo, true);
      } catch {
        callback(saveNo, false);
      }
    } else callback(saveNo, unauthedSave(survey));
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
