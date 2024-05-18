<script setup lang="ts">
import { useSurveyStore } from "@/store/surveyer/survey";

const surveyerStore = useSurveyStore();
const { searchQuery } = storeToRefs(surveyerStore);
</script>

<template>
  <v-text-field v-model="searchQuery" append-inner-icon="mdi-magnify" label="Search" hide-details />
</template>
