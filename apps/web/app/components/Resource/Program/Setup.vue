<script setup lang="ts">
import type { UiSelectItem } from "#src/models/ui/UiSelectItem";
import type { Page } from "@esposter/db-schema";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { readAllResourcePages } from "#src/services/resource/readAllResourcePages";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { prependNoneSelectItem } from "#src/services/ui/prependNoneSelectItem";
import { useProgramStore } from "#src/store/resource/program/index";
import { SurveyResponseMode } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const programStore = useProgramStore();
const { loadContent, saveProgram } = programStore;
const { programResource } = storeToRefs(programStore);
const audience = computed({
  get: () => programResource.value.audience,
  set: (value) => {
    programResource.value.audience = value;
  },
});
const { dataset, error } = useDataset(audience);
const selectedSurveyId = ref("");
const surveyContentId = ref("");
const { data: surveyContent, refresh: refreshSurveyContent } = useQuery(
  () => $trpc.survey.readResourceContent.query({ id: selectedSurveyId.value }),
  {
    isLazy: true,
    onSuccess: () => {
      surveyContentId.value = selectedSurveyId.value;
    },
  },
);
const isAnonymousSurvey = computed(
  () =>
    Boolean(programResource.value.surveyId) &&
    surveyContentId.value === programResource.value.surveyId &&
    surveyContent.value?.settings.responseMode === SurveyResponseMode.Anonymous,
);
// The key column can only be one the audience actually has, so it is picked, never typed
const keyColumnItems = computed<UiSelectItem<string>[]>(() =>
  prependNoneSelectItem(
    dataset.value?.columns.map(({ name }) => ({ meaning: UiIconMeaning.Columns, title: name, value: name })) ?? [],
  ),
);
// Absent until read, so a failed read never claims every binding is missing
const emailResources = ref<Page<UiSelectItem<string>>>();
const surveyResources = ref<Page<UiSelectItem<string>>>();
await loadContent();
watchImmediate(
  () => programResource.value.surveyId,
  async (surveyId) => {
    selectedSurveyId.value = surveyId;
    surveyContentId.value = "";
    if (surveyId) await refreshSurveyContent();
  },
);
// Both binding pickers are independent of each other, so they resolve together, each read to the end of its list so a
// Binding past the first page is still offered. A whole list is one that has no next cursor
await getResultAsync(async () => {
  const [emails, surveys] = await Promise.all([
    readAllResourcePages((cursor) => $trpc.email.readResources.query({ cursor })),
    readAllResourcePages((cursor) => $trpc.survey.readResources.query({ cursor })),
  ]);
  emailResources.value = {
    items: emails.map(({ id, name }) => ({ meaning: UiIconMeaning.Email, title: name, value: id })),
    nextCursor: "",
  };
  surveyResources.value = {
    items: surveys.map(({ id, name }) => ({ meaning: UiIconMeaning.Survey, title: name, value: id })),
    nextCursor: "",
  };
}).match(noop, createErrorAlert);
// Autosave binding edits — registered after the load, so the hydration itself never reaches the watcher
watchAutosave(programResource, saveProgram);
</script>

<!-- Who the program reaches beside what it sends them, each a card of its own, so a wide blade reads the two halves
  side by side and a narrow one stacks them in the order a program is set up -->
<template>
  <div gap-4 grid items-start ui-body md:cols-2>
    <UiFrame title="Audience">
      <p text-muted>The dataset the participants come from, and the column that tells one participant from another.</p>
      <DatasetReferencePicker v-model="audience" :error />
      <div flex flex-col gap-1>
        <span text-sm text-muted>Key column</span>
        <UiSelect v-model="programResource.keyColumn" :items="keyColumnItems" label="Key column" />
      </div>
    </UiFrame>
    <UiFrame title="Bindings">
      <p text-muted>The email that invites participants, and the survey their link opens.</p>
      <ResourceLinkSelect v-model="programResource.emailId" :resources="emailResources" label="Email" />
      <ResourceLinkSelect v-model="programResource.surveyId" :resources="surveyResources" label="Survey">
        <template #warning>
          <ResourceProgramSurveyModeWarning v-if="isAnonymousSurvey" />
        </template>
      </ResourceLinkSelect>
    </UiFrame>
  </div>
</template>
