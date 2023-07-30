<script setup lang="ts">
import { SurveyConfiguration } from "@/models/surveyer/SurveyConfiguration";
import { useSurveyerStore } from "@/store/surveyer";

const surveyerStore = useSurveyerStore();
const { createSurveyConfiguration } = surveyerStore;
</script>

<template>
  <v-tooltip :text="`Create Survey`">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        variant="elevated"
        :flat="false"
        :="tooltipProps"
        @click="createSurveyConfiguration(new SurveyConfiguration())"
      >
        <v-icon icon="mdi-plus" />
      </v-btn>
    </template>
  </v-tooltip>
</template>
