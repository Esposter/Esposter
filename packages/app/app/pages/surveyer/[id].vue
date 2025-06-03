<script setup lang="ts">
import { validate } from "@/services/router/validate";

defineRouteRules({ ssr: false });
definePageMeta({ middleware: "auth", validate });

const survey = ref(await useReadSurveyFromRoute());
const { creator, dialog } = useSurveyCreator(survey);
</script>

<template>
  <NuxtLayout>
    <div h-full flex flex-col>
      <SurveyerHeader v-model="survey" />
      <SurveyCreatorComponent :model="creator" />
    </div>
    <SurveyerPublishSurveyDialog v-model="dialog" v-model:survey="survey" />
  </NuxtLayout>
</template>

<style scoped lang="scss">
:deep(.svc-creator__banner) {
  display: none;
}
</style>
