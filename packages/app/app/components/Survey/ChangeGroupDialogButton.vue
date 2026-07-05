<script setup lang="ts">
import type { Survey } from "@esposter/db-schema";

import { useSurveyStore } from "@/store/survey";
import { selectSurveySchema } from "@esposter/db-schema";

interface ChangeGroupDialogButtonProps {
  survey: Survey;
}

const { survey } = defineProps<ChangeGroupDialogButtonProps>();
const surveyStore = useSurveyStore();
const { updateSurvey } = surveyStore;
const group = ref(survey.group);
</script>

<template>
  <StyledDialog
    :card-props="{ title: 'Change Group' }"
    :confirm-button-props="{
      text: 'Change',
      disabled: selectSurveySchema.shape.group.safeParse(group).data === survey.group,
    }"
    @confirm="
      async (onComplete) => {
        await updateSurvey({ ...survey, group });
        onComplete();
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <StyledTooltipIconButton
        :button-props="{ class: 'm-0', size: 'small', tile: true }"
        icon="mdi-folder-arrow-left-right"
        text="Change Group"
        @click.stop="updateIsOpen(true)"
      />
    </template>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <SurveyGroupCombobox v-model="group" />
        </v-col>
      </v-row>
    </v-container>
  </StyledDialog>
</template>
