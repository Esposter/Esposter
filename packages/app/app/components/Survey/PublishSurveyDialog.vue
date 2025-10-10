<script setup lang="ts">
import type { Survey } from "@esposter/db-schema";

const { $trpc } = useNuxtApp();
const dialog = defineModel<boolean>({ required: true });
const survey = defineModel<Survey>("survey", { required: true });
</script>

<template>
  <StyledDialog
    v-model="dialog"
    :card-props="{ title: 'Publish Survey' }"
    :confirm-button-props="{ text: 'Publish' }"
    @submit="
      async () => {
        Object.assign(
          survey,
          await $trpc.survey.publishSurvey.mutate({ id: survey.id, publishVersion: survey.publishVersion }),
        );
        dialog = false;
      }
    "
  >
    <v-card-text class="text-error">
      You are about to publish your changes to <span font-bold>{{ survey.name }}</span
      >. This will cause all active surveys to use this version.
    </v-card-text>
  </StyledDialog>
</template>
