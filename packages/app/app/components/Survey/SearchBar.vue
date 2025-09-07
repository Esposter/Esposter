<script setup lang="ts">
import { useSurveyStore } from "@/store/survey";

const surveyStore = useSurveyStore();
const { searchQuery } = storeToRefs(surveyStore);
</script>

<template>
  <v-text-field v-model="searchQuery" append-inner-icon="mdi-magnify" label="Search" hide-details />
</template>
