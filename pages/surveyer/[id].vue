<script setup lang="ts">
// @TODO: Nuxt cannot build survey-creator-core yet
// import { useSurveyStore } from "@/store/surveyer/survey";
// import { uuidValidateV4 } from "@/util/uuid";
// import "survey-core/defaultV2.min.css";
// import "survey-core/survey.i18n.js";
// import { SurveyCreatorModel } from "survey-creator-core";
// import "survey-creator-core/survey-creator-core.i18n.js";
// import "survey-creator-core/survey-creator-core.min.css";

// defineRouteRules({ ssr: false });
definePageMeta({ middleware: "auth" });

// await useReadSurveys();
// const { status } = useAuth();
// const route = useRoute();
// const surveyerStore = useSurveyStore();
// const { updateSurvey, autoSave } = surveyerStore;
// const { surveyList } = storeToRefs(surveyerStore);

// const routeParamsId = route.params.id;
// if (!(typeof routeParamsId === "string" && uuidValidateV4(routeParamsId)))
//   throw createError({ statusCode: 404, statusMessage: "Survey id is invalid" });

// const creator = new SurveyCreatorModel({
//   showLogicTab: true,
//   isAutoSave: true,
// });
// const survey = surveyList.value.find((s) => s.rowKey === routeParamsId);
// if (!survey) throw createError({ statusCode: 404, statusMessage: "Survey could not be found" });

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

throw createError({ statusCode: 404, statusMessage: "Not implemented" });
</script>

<template>
  <NuxtLayout>
    <!-- <SurveyCreatorComponent :model="creator" /> -->
  </NuxtLayout>
</template>

<style lang="scss">
.svc-creator {
  width: 100%;
  height: calc(100dvh - $app-bar-height);
}
</style>
