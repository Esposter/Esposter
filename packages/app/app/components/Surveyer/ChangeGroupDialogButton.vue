<script setup lang="ts">
import type { Survey } from "#shared/db/schema/surveys";

import { formRules } from "@/services/vuetify/formRules";
import { useSurveyStore } from "@/store/surveyer/survey";

interface SurveyerChangeGroupDialogButtonProps {
  survey: Survey;
}

const { survey } = defineProps<SurveyerChangeGroupDialogButtonProps>();
const surveyerStore = useSurveyStore();
const { updateSurvey } = surveyerStore;
const group = ref(survey.group);
</script>

<template>
  <StyledDialog
    :card-props="{ title: 'Change Group' }"
    :confirm-button-props="{ color: 'primary', text: 'Change' }"
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
          <v-btn
            m-0="!"
            rd-none="!"
            icon="mdi-folder-arrow-left-right"
            size="small"
            :="props"
            @click.stop="updateIsOpen(true)"
          />
        </template>
      </v-tooltip>
    </template>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <SurveyerGroupCombobox v-model="group" :rules="[formRules.isNotEqual(survey.group)]" />
        </v-col>
      </v-row>
    </v-container>
  </StyledDialog>
</template>
