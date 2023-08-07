<script setup lang="ts">
import { formRules } from "@/services/vuetify/formRules";
import { useSurveyerStore } from "@/store/surveyer";
import type { Survey } from "models/surveyer/Survey";

interface SurveyerChangeGroupDialogButtonProps {
  survey: Survey;
}

const props = defineProps<SurveyerChangeGroupDialogButtonProps>();
const { survey } = toRefs(props);
const surveyerStore = useSurveyerStore();
const { updateSurvey } = surveyerStore;
const group = ref<string | null>(null);
</script>

<template>
  <StyledDialog
    :card-props="{ title: 'Change Group' }"
    :confirm-button-props="{ color: 'primary', text: 'Change Group' }"
    @confirm="
      (onComplete) => {
        updateSurvey({ ...survey, group });
        onComplete();
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Change Group">
        <template #activator="{ props: activatorProps }">
          <v-btn variant="elevated" :flat="false" :="activatorProps" @click="updateIsOpen(true)">
            <v-icon icon="mdi-folder-arrow-left-right" />
          </v-btn>
        </template>
      </v-tooltip>
    </template>
    <v-form ref="formRef">
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="group" label="Group" :rule="[formRules.isNotEqual(survey.group)]" />
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </StyledDialog>
</template>
