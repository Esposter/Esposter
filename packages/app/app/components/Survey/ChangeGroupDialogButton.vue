<script setup lang="ts">
import type { Survey } from "@esposter/db-schema";

import { selectSurveySchema } from "@esposter/db-schema";
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
    :confirm-button-props="{
      text: 'Change',
      disabled: selectSurveySchema.shape.group.safeParse(group).data === survey.group,
    }"
    @confirm="
      async (onComplete) => {
        await updateSurvey({ ...survey, group });
        onComplete();
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Change Group">
        <template #activator="{ props }">
          <v-btn icon="mdi-folder-arrow-left-right" size="small" tile m-0 :="props" @click.stop="updateIsOpen(true)" />
        </template>
      </v-tooltip>
    </template>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <SurveyGroupCombobox v-model="group" />
        </v-col>
      </v-row>
    </v-container>
  </StyledDialog>
</template>
