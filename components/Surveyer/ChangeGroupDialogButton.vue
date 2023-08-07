<script setup lang="ts">
import type { Survey } from "@/models/surveyer/Survey";
import { formRules } from "@/services/vuetify/formRules";
import { useSurveyerStore } from "@/store/surveyer";

interface SurveyerChangeGroupDialogButtonProps {
  survey: Survey;
}

const props = defineProps<SurveyerChangeGroupDialogButtonProps>();
const { survey } = toRefs(props);
const surveyerStore = useSurveyerStore();
const { updateSurvey } = surveyerStore;
const valid = ref(false);
const group = ref(survey.value.group);
</script>

<template>
  <StyledDialog
    :card-props="{ title: 'Change Group' }"
    :confirm-button-props="{ color: 'primary', text: 'Change Group', disabled: !valid }"
    @confirm="
      (onComplete) => {
        updateSurvey({ ...survey, group });
        onComplete();
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Change Group">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            m="0!"
            rd="0!"
            icon="mdi-folder-arrow-left-right"
            size="small"
            :="tooltipProps"
            @click.stop="updateIsOpen(true)"
          />
        </template>
      </v-tooltip>
    </template>
    <v-form v-model="valid">
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="group" label="Group" :rules="[formRules.isNotEqual(survey.group)]" />
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </StyledDialog>
</template>
