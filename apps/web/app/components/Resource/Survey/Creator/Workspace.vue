<script setup lang="ts">
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { noop } from "@esposter/shared";

// The toolbar over the survey being edited, or over the runner that previews it, in whichever layout the shell gives it
const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument, isPreview } = storeToRefs(surveyCreatorStore);
</script>

<template>
  <ResourceSurveyCreatorToolbar />
  <ResourceSurveyRunner v-if="isPreview" :document="surveyDocument" :on-complete="noop" />
  <ResourceSurveyCreatorCanvas v-else />
</template>
