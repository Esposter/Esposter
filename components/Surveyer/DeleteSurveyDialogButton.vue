<script setup lang="ts">
import { useSurveyStore } from "@/store/surveyer/survey";

interface DeleteSurveyButtonDialogProps {
  rowKey: string;
}

const { rowKey } = defineProps<DeleteSurveyButtonDialogProps>();
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
