<script setup lang="ts">
import { useSurveyStore } from "@/store/surveyer/survey";

interface DeleteSurveyButtonDialogProps {
  id: string;
}

const { id } = defineProps<DeleteSurveyButtonDialogProps>();
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
        await deleteSurvey(id);
        onComplete();
      }
    "
  />
</template>
