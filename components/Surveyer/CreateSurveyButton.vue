<script setup lang="ts">
import { Survey } from "@/models/surveyer/Survey";
import { useSurveyerStore } from "@/store/surveyer";

const surveyerStore = useSurveyerStore();
const { createSurvey } = surveyerStore;
</script>

<template>
  <v-tooltip text="Create Survey">
    <template #activator="{ props }">
      <v-btn variant="elevated" :flat="false" :="props" @click="createSurvey(new Survey())">
        <v-icon icon="mdi-plus" />
      </v-btn>
    </template>
  </v-tooltip>
</template>
