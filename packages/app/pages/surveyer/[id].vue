<script setup lang="ts">
// @TODO: Nuxt build fails to build this atm
// import { validate } from "@/services/router/validate";
// import { useSurveyStore } from "@/store/surveyer/survey";
// import "survey-core/defaultV2.min.css";
// import "survey-core/survey.i18n.js";
// import { SurveyCreatorModel } from "survey-creator-core";
// import "survey-creator-core/survey-creator-core.i18n.js";
// import "survey-creator-core/survey-creator-core.min.css";

// defineRouteRules({ ssr: false });
// definePageMeta({ middleware: "auth", validate });

// const survey = await useReadSurveyFromRoute();
// const { status } = useAuth();
// const surveyerStore = useSurveyStore();
// const { autoSave, updateSurvey } = surveyerStore;
// const creator = new SurveyCreatorModel({ isAutoSave: true, showLogicTab: true });
// creator.text = survey.model;
// creator.saveSurveyFunc = async (saveNo: number, callback: Function) => {
//   survey.model = creator.text;
//   survey.updatedAt = new Date();

//   if (status.value === "authenticated")
//     try {
//       await updateSurvey(survey);
//       callback(saveNo, true);
//     } catch {
//       callback(saveNo, false);
//     }
//   else if (status.value === "unauthenticated") callback(saveNo, autoSave(survey));
// };
</script>

<template>
  <NuxtLayout>
    <!-- <SurveyCreatorComponent :model="creator" /> -->
  </NuxtLayout>
</template>
