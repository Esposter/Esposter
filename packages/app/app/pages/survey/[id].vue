<script setup lang="ts">
import { validate } from "@/services/router/validate";
import { Model } from "survey-core";
import { SurveyComponent } from "survey-vue3-ui";

definePageMeta({ validate });

const survey = await useReadSurveyFromRoute();
const model = new Model(survey.model);
</script>

<template>
  <NuxtLayout>
    <SurveyComponent :model />
  </NuxtLayout>
</template>
