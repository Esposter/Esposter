<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import type { SurveyEntity } from "@/models/surveyer/SurveyEntity";
import { DEFAULT_NAME } from "@/services/shared/constants";
import { formRules } from "@/services/vuetify/formRules";
import { useSurveyStore } from "@/store/surveyer/survey";
import type { VCard } from "vuetify/components";

interface CreateSurveyDialogProps {
  cardProps?: VCard["$props"];
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => unknown;
}>();
const modelValue = defineModel<{
  name: SurveyEntity["name"];
  group: SurveyEntity["group"];
  model: SurveyEntity["model"];
}>({ default: { name: DEFAULT_NAME, group: null, model: "" }, local: true });
const initialModelValue = modelValue.value;
const { cardProps } = defineProps<CreateSurveyDialogProps>();
const surveyerStore = useSurveyStore();
const { createSurvey } = surveyerStore;
const valid = ref(false);
const resetSurvey = () => {
  // Hack resetting the item so the dialog content doesn't change
  // until after the CSS animation that lasts 300ms ends
  window.setTimeout(() => {
    modelValue.value = initialModelValue;
  }, 300);
};
</script>

<template>
  <StyledCreateDialog
    :card-props="cardProps"
    :confirm-button-props="{ disabled: !valid }"
    @create="
      async (onComplete) => {
        await createSurvey(modelValue);
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
            <v-text-field v-model="modelValue.name" label="Name" :rules="[formRules.required]" />
          </v-col>
          <v-col cols="12">
            <SurveyerGroupCombobox v-model="modelValue.group" />
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </StyledCreateDialog>
</template>
