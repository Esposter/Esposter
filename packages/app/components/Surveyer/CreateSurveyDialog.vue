<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import type { Survey } from "@/server/db/schema/surveys";
import type { VCard } from "vuetify/components";

import { formRules } from "@/services/vuetify/formRules";
import { DEFAULT_NAME } from "@/shared/services/constants";
import { SURVEY_NAME_MAX_LENGTH } from "@/shared/services/surveyer/constants";
import { useSurveyStore } from "@/store/surveyer/survey";

interface CreateSurveyDialogProps {
  cardProps?: VCard["$props"];
  initialValue?: Pick<Survey, "group" | "model" | "name">;
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => unknown;
}>();
const { cardProps, initialValue = { group: null, model: "", name: DEFAULT_NAME } } =
  defineProps<CreateSurveyDialogProps>();
const surveyerStore = useSurveyStore();
const { createSurvey } = surveyerStore;
const name = ref(initialValue.name);
const group = ref(initialValue.group);
const resetSurvey = () => {
  // Hack resetting the item so the dialog content doesn't change
  // until after the CSS animation that lasts 300ms ends
  window.setTimeout(() => {
    name.value = initialValue.name;
    group.value = initialValue.group;
  }, 300);
};
</script>

<template>
  <StyledCreateDialog
    :card-props
    @create="
      async (onComplete) => {
        await createSurvey({ name, group, model: initialValue.model });
        resetSurvey();
        onComplete();
      }
    "
  >
    <template #activator="activatorProps">
      <slot name="activator" :="activatorProps" />
    </template>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="name"
            label="Name"
            :rules="[formRules.required, formRules.requireAtMostNCharacters(SURVEY_NAME_MAX_LENGTH)]"
          />
        </v-col>
        <v-col cols="12">
          <SurveyerGroupCombobox v-model="group" />
        </v-col>
      </v-row>
    </v-container>
  </StyledCreateDialog>
</template>
