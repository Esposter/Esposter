<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import { Survey } from "@/models/surveyer/Survey";
import { formRules } from "@/services/vuetify/formRules";
import { useSurveyerStore } from "@/store/surveyer";
import type { VCard } from "vuetify/components";

interface CreateSurveyDialogProps {
  initialValue: Survey;
  cardProps?: VCard["$props"];
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => unknown;
  default: (props: {}) => unknown;
}>();
const { initialValue, cardProps } = defineProps<CreateSurveyDialogProps>();
const surveyerStore = useSurveyerStore();
const { createSurvey } = surveyerStore;
const valid = ref(false);
const survey = ref(initialValue);
const resetSurvey = () => {
  // Hack resetting the item so the dialog content doesn't change
  // until after the CSS animation that lasts 300ms ends
  window.setTimeout(() => {
    survey.value = initialValue;
  }, 300);
};
</script>

<template>
  <StyledCreateDialog
    :card-props="cardProps"
    :confirm-button-props="{ disabled: !valid }"
    @create="
      (onComplete) => {
        createSurvey(survey);
        resetSurvey();
        onComplete();
      }
    "
  >
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <v-form v-model="valid">
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="survey.name" label="Name" :rules="[formRules.required]" />
          </v-col>
          <v-col cols="12">
            <SurveyerGroupCombobox v-model="survey.group" />
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </StyledCreateDialog>
</template>
