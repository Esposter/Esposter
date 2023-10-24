<script setup lang="ts">
// @TODO: nuxt cannot build survey-creator-core atm
// import { useSurveyStore } from "@/store/surveyer/survey";
// import "survey-core/defaultV2.min.css";
// import "survey-creator-core/survey-creator-core.min.css";
// import { SurveyCreator } from "survey-creator-knockout";

// await useReadSurveys();
// const { status } = useAuth();
// const route = useRoute();
// const surveyerStore = useSurveyStore();
// const { updateSurvey, unauthedSave } = surveyerStore;
// const { surveyList } = storeToRefs(surveyerStore);
// const surveyCreatorId = "survey-creator";

// onMounted(() => {
//   if (!(typeof route.params.id === "string" && uuidValidateV4(route.params.id)))
//     throw createError({ statusCode: 404, statusMessage: "Survey id is invalid" });

//   const creator = new SurveyCreator({
//     showLogicTab: true,
//     isAutoSave: true,
//   });
//   const survey = surveyList.value.find((s) => s.rowKey === route.params.id);
//   if (!survey) throw createError({ statusCode: 404, statusMessage: "Survey could not be found" });

//   creator.text = survey.model;
//   creator.saveSurveyFunc = async (saveNo: number, callback: Function) => {
//     survey.model = creator.text;
//     survey.updatedAt = new Date();

//     if (status.value === "authenticated") {
//       try {
//         await updateSurvey(survey);
//         callback(saveNo, true);
//       } catch {
//         callback(saveNo, false);
//       }
//     } else if (status.value === "unauthenticated") callback(saveNo, unauthedSave(survey));
//   };
//   creator.render(surveyCreatorId);
// });
throw createError({ statusCode: 404 });
</script>

<template>
  <NuxtLayout>
    <!-- <div :id="surveyCreatorId" /> -->
  </NuxtLayout>
</template>

<style scoped lang="scss">
#survey-creator {
  width: 100%;
  height: calc(100dvh - $app-bar-height);
}
</style>
