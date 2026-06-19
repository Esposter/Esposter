<script setup lang="ts">
import type { StyledDialogActivatorSlotProps } from "@/components/Styled/Dialog.vue";
import type { Survey } from "@esposter/db-schema";
import type { VCard } from "vuetify/components";

import { DEFAULT_NAME } from "#shared/services/constants";
import { dayjs } from "#shared/services/dayjs";
import { useSurveyStore } from "@/store/survey";
import { SURVEY_NAME_MAX_LENGTH } from "@esposter/db-schema";
import { withFinalizerAsync } from "@esposter/shared";

interface CreateSurveyDialogProps {
  cardProps?: VCard["$props"];
  initialValue?: Pick<Survey, "group" | "model" | "name">;
}

defineSlots<{
  activator: (props: StyledDialogActivatorSlotProps) => VNode;
}>();
const { cardProps, initialValue = { group: "", model: "", name: DEFAULT_NAME } } =
  defineProps<CreateSurveyDialogProps>();
const rules = useVRules();
const surveyStore = useSurveyStore();
const { createSurvey } = surveyStore;
const name = ref(initialValue.name);
const group = ref(initialValue.group);
</script>

<template>
  <StyledCreateFormDialog
    :card-props
    @create="
      async (onComplete) => {
        await withFinalizerAsync(() => createSurvey({ name, group, model: initialValue.model }), onComplete);
        useTimeoutFn(() => {
          name = initialValue.name;
          group = initialValue.group;
        }, dayjs.duration(0.3, 'seconds').asMilliseconds());
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
            :rules="[rules.required(), rules.maxLength(SURVEY_NAME_MAX_LENGTH)]"
          />
        </v-col>
        <v-col cols="12">
          <SurveyGroupCombobox v-model="group" />
        </v-col>
      </v-row>
    </v-container>
  </StyledCreateFormDialog>
</template>
