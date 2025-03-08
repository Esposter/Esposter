<script setup lang="ts">
// @TODO: Nuxt build fails to build this atm
// import { authClient } from "@/services/auth/authClient";
// import { validate } from "@/services/router/validate";
// import { useSurveyStore } from "@/store/surveyer/survey";
// import "survey-core/survey-core.min.css";
// import "survey-core/survey.i18n";
// import { SurveyCreatorModel } from "survey-creator-core";
// import "survey-creator-core/survey-creator-core.i18n";
// import "survey-creator-core/survey-creator-core.min.css";

// defineRouteRules({ ssr: false });
// definePageMeta({ middleware: "auth", validate });

// const survey = await useReadSurveyFromRoute();
// const { data: session } = await authClient.useSession(useFetch);
// const surveyerStore = useSurveyStore();
// const { updateSurvey } = surveyerStore;
// const creator = new SurveyCreatorModel({ autoSaveEnabled: true, showTranslationTab: true });
// creator.text = survey.model;
// creator.saveSurveyFunc = async (saveNo: number, callback: Function) => {
//   survey.model = creator.text;

//   if (session.value)
//     try {
//       const isSuccessful = await updateSurvey(survey);
//       callback(saveNo, isSuccessful);
//     } catch {
//       callback(saveNo, false);
//     }
// };
</script>

<template>
  <NuxtLayout>
    <!-- <SurveyCreatorComponent :model="creator" /> -->
  </NuxtLayout>
</template>
