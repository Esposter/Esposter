<script setup lang="ts">
import type { Survey } from "#shared/db/schema/surveys";

const { $trpc } = useNuxtApp();
const survey = defineModel<Survey>({ required: true });
</script>

<template>
  <v-toolbar class="border-b-sm" color="surface">
    <StyledEditableToolbarTitle
      px-4
      :initial-value="survey.name"
      @update="
        async (value, onComplete) => {
          try {
            if (!value || value === survey.name) return;
            Object.assign(survey, await $trpc.survey.updateSurvey.mutate({ id: survey.id, name: value }));
          } finally {
            onComplete();
          }
        }
      "
    >
      <span pl-2 class="text-gray text-lg">
        (Version: {{ survey.modelVersion }}, Published Version: {{ survey.publishVersion }})
      </span>
    </StyledEditableToolbarTitle>
  </v-toolbar>
</template>
