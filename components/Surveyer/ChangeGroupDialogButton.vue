<script setup lang="ts">
import type { SurveyEntity } from "@/models/surveyer/SurveyEntity";
import { formRules } from "@/services/vuetify/formRules";
import { useSurveyStore } from "@/store/surveyer/survey";

interface SurveyerChangeGroupDialogButtonProps {
  survey: SurveyEntity;
}

const { survey } = defineProps<SurveyerChangeGroupDialogButtonProps>();
const surveyerStore = useSurveyStore();
const { updateSurvey } = surveyerStore;
const valid = ref(false);
const group = ref(survey.group);
</script>

<template>
  <StyledDialog
    :card-props="{ title: 'Change Group' }"
    :confirm-button-props="{ color: 'primary', text: 'Change', disabled: !valid }"
    @confirm="
      async (onComplete) => {
        await updateSurvey({ ...survey, group });
        onComplete();
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Change Group">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            m-0="!"
            rd-0="!"
            icon="mdi-folder-arrow-left-right"
            size="small"
            :="tooltipProps"
            @click.stop="updateIsOpen(true)"
          />
        </template>
      </v-tooltip>
    </template>
    <v-form v-model="valid" @submit="(e) => e.preventDefault()">
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <SurveyerGroupAutocomplete v-model="group" :rules="[formRules.isNotEqual(survey.group)]" />
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </StyledDialog>
</template>
