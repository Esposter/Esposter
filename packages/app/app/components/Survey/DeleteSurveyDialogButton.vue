<script setup lang="ts">
import { useSurveyStore } from "@/store/survey";

interface DeleteSurveyButtonDialogProps {
  id: string;
}

const { id } = defineProps<DeleteSurveyButtonDialogProps>();
const surveyStore = useSurveyStore();
const { deleteSurvey } = surveyStore;
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
