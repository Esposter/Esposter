<script setup lang="ts">
import { useSurveyStore } from "@/store/survey";

const surveyStore = useSurveyStore();
const { searchQuery } = storeToRefs(surveyStore);
</script>

<template>
  <v-text-field v-model="searchQuery" max-width="20rem" append-inner-icon="mdi-magnify" label="Search" hide-details />
</template>
