<script setup lang="ts">
import { Survey } from "@/models/surveyer/Survey";
import type { VFormRef } from "@/models/vuetify/VFormRef";
import { formRules } from "@/services/vuetify/formRules";
import { useSurveyerStore } from "@/store/surveyer";

const surveyerStore = useSurveyerStore();
const { createSurvey } = surveyerStore;
const formRef = ref<VFormRef>();
const valid = computed(() => formRef.value?.errors.length === 0);
const survey = ref(new Survey());
const resetSurvey = () => {
  // Hack resetting the item so the dialog content doesn't change
  // until after the CSS animation that lasts 300ms ends
  window.setTimeout(() => {
    survey.value = new Survey();
  }, 300);
};
</script>

<template>
  <StyledCreateDialog
    :card-props="{ title: 'Create Survey' }"
    :confirm-button-props="{ disabled: !valid }"
    @create="
      (onComplete) => {
        createSurvey(survey);
        resetSurvey();
        onComplete();
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-tooltip text="Create Survey">
        <template #activator="{ props }">
          <v-btn variant="elevated" :flat="false" :="props" @click="updateIsOpen(true)">
            <v-icon icon="mdi-plus" />
          </v-btn>
        </template>
      </v-tooltip>
    </template>
    <v-form ref="formRef">
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="survey.name" label="Name" :rules="[formRules.required]" />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="survey.group" label="Group" />
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </StyledCreateDialog>
</template>
