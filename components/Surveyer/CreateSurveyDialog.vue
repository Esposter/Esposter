<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import type { Survey } from "@/db/schema/surveys";
import { DEFAULT_NAME } from "@/services/shared/constants";
import { formRules } from "@/services/vuetify/formRules";
import { useSurveyStore } from "@/store/surveyer/survey";
import type { VCard } from "vuetify/components";

interface CreateSurveyDialogProps {
  initialValue?: Pick<Survey, "name" | "group" | "model">;
  cardProps?: VCard["$props"];
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => unknown;
}>();
const { initialValue = { name: DEFAULT_NAME, group: null, model: "" }, cardProps } =
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
    :card-props="cardProps"
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
          <v-text-field v-model="name" label="Name" :rules="[formRules.required]" />
        </v-col>
        <v-col cols="12">
          <SurveyerGroupCombobox v-model="group" />
        </v-col>
      </v-row>
    </v-container>
  </StyledCreateDialog>
</template>
