<script setup lang="ts">
import type { Survey } from "#shared/db/schema/surveys";

import { useSurveyStore } from "@/store/survey";

interface ChangeGroupDialogButtonProps {
  survey: Survey;
}

const { survey } = defineProps<ChangeGroupDialogButtonProps>();
const surveyStore = useSurveyStore();
const { updateSurvey } = surveyStore;
const group = ref(survey.group);
</script>

<template>
  <StyledDialog
    :card-props="{ title: 'Change Group' }"
    :confirm-button-props="{ color: 'primary', text: 'Change', disabled: group === survey.group }"
    @submit="
      async (_event, onComplete) => {
        await updateSurvey({ ...survey, group });
        onComplete();
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Change Group">
        <template #activator="{ props }">
          <v-btn m-0 icon="mdi-folder-arrow-left-right" size="small" tile :="props" @click.stop="updateIsOpen(true)" />
        </template>
      </v-tooltip>
    </template>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <SurveyGroupCombobox :model-value="group" @update:model-value="group = $event?.trim() ?? null" />
        </v-col>
      </v-row>
    </v-container>
  </StyledDialog>
</template>
