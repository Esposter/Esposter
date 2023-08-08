<script setup lang="ts">
import { useSurveyerStore } from "@/store/surveyer";

interface SurveyerDeleteSurveyButtonDialogProps {
  surveyId: string;
}

const { surveyId } = defineProps<SurveyerDeleteSurveyButtonDialogProps>();
const surveyerStore = useSurveyerStore();
const { deleteSurvey } = surveyerStore;
</script>

<template>
  <StyledConfirmDeleteDialogButton
    :card-props="{
      title: 'Delete Survey',
      text: 'Are you sure you want to delete this survey?',
    }"
    @delete="
      (onComplete) => {
        deleteSurvey(surveyId);
        onComplete();
      }
    "
  />
</template>
