<script setup lang="ts">
import { useSurveyStore } from "@/store/surveyer/survey";

interface SurveyerDeleteSurveyButtonDialogProps {
  rowKey: string;
}

const { rowKey } = defineProps<SurveyerDeleteSurveyButtonDialogProps>();
const surveyerStore = useSurveyStore();
const { deleteSurvey } = surveyerStore;
</script>

<template>
  <StyledConfirmDeleteDialogButton
    :card-props="{
      title: 'Delete Survey',
      text: 'Are you sure you want to delete this survey?',
    }"
    @delete="
      async (onComplete) => {
        await deleteSurvey({ rowKey });
        onComplete();
      }
    "
  />
</template>
