<script setup lang="ts">
import { SurveyConfiguration } from "@/models/surveyer/SurveyConfiguration";
import { useSurveyerStore } from "@/store/surveyer";

const surveyerStore = useSurveyerStore();
const { createSurveyConfiguration } = surveyerStore;
</script>

<template>
  <v-tooltip text="Create Survey">
    <template #activator="{ props }">
      <v-btn variant="elevated" :flat="false" :="props" @click="createSurveyConfiguration(new SurveyConfiguration())">
        <v-icon icon="mdi-plus" />
      </v-btn>
    </template>
  </v-tooltip>
</template>
