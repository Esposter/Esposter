<script setup lang="ts">
import type { Survey } from "#shared/db/schema/surveys";

import { SURVEY_NAME_MAX_LENGTH } from "#shared/services/survey/constants";

const { $trpc } = useNuxtApp();
const survey = defineModel<Survey>({ required: true });
</script>

<template>
  <v-toolbar class="border-b-sm" color="surface" density="comfortable">
    <StyledEditableNameDialogButton
      px-4
      :card-props="{ title: 'Edit Survey Name' }"
      :max-length="SURVEY_NAME_MAX_LENGTH"
      :name="survey.name"
      :tooltip-props="{ location: 'bottom', text: 'Edit Survey Name' }"
      @submit="
        async (name) => {
          Object.assign(survey, await $trpc.survey.updateSurvey.mutate({ id: survey.id, name }));
        }
      "
    />
    <span pl-2 text-gray text-lg>
      (Version: {{ survey.modelVersion }}, Published Version: {{ survey.publishVersion }})
    </span>
  </v-toolbar>
</template>

<style scoped lang="scss">
:deep(.v-toolbar__content) {
  min-height: $app-bar-height;
  height: auto !important;
}
</style>
