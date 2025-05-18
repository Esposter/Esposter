<script setup lang="ts">
import { validate } from "@/services/router/validate";

defineRouteRules({ ssr: false });
definePageMeta({ middleware: "auth", validate });

const { $trpc } = useNuxtApp();
const survey = reactive(await useReadSurveyFromRoute());
const { creator, dialog } = useSurveyCreator(survey);
</script>

<template>
  <NuxtLayout>
    <div h-full flex flex-col>
      <v-toolbar class="border-b-sm" color="surface">
        <v-toolbar-title px-4 font-bold>
          {{ survey.name }}
          <span class="text-gray text-lg">
            (Version: {{ survey.modelVersion }}, Published Version: {{ survey.publishVersion }})
          </span>
        </v-toolbar-title>
      </v-toolbar>
      <SurveyCreatorComponent flex-1 :model="creator" />
    </div>
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
  </NuxtLayout>
</template>

<style scoped lang="scss">
:deep(.svc-creator__banner) {
  display: none;
}
</style>
