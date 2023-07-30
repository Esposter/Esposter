<script setup lang="ts">
import { useSurveyerStore } from "@/store/surveyer";

const surveyerStore = useSurveyerStore();
const { searchQuery } = storeToRefs(surveyerStore);
</script>

<template>
  <v-text-field v-model="searchQuery" append-inner-icon="mdi-magnify" label="Search" hide-details />
</template>
