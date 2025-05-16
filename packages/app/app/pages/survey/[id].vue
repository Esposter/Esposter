<script setup lang="ts">
import { validate } from "@/services/router/validate";
import { Model } from "survey-core";
import { SurveyComponent } from "survey-vue3-ui";

definePageMeta({ validate });

const route = useRoute();
const surveyId = route.params.id as string;
const { $trpc } = useNuxtApp();
const surveyModelSasUrl = await $trpc.survey.generateSurveyModelSasUrl.query(surveyId);
const { data } = await useFetch<string>(surveyModelSasUrl);
</script>

<template>
  <NuxtLayout>
    <SurveyComponent v-if="data" :model="new Model(data)" />
  </NuxtLayout>
</template>
