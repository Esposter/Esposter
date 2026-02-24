<script setup lang="ts">
import type { Survey } from "@esposter/db-schema";

import { SURVEY_NAME_MAX_LENGTH } from "@esposter/db-schema";

const { $trpc } = useNuxtApp();
const survey = defineModel<Survey>({ required: true });
</script>

<template>
  <v-toolbar class="border-b-sm" density="comfortable">
    <StyledEditableNameDialogButton
      :button-props="{ class: 'ml-4' }"
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
    <template #append>
      <span pr-4 text-gray text-lg>
        (Version: {{ survey.modelVersion }}, Published Version: {{ survey.publishVersion }})
      </span>
    </template>
  </v-toolbar>
</template>

<style scoped lang="scss">
:deep(.v-toolbar__content) {
  min-height: $app-bar-height;
  height: auto !important;
}
</style>
