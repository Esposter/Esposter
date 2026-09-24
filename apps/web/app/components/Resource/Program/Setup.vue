<script setup lang="ts">
import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useProgramStore } from "@/store/resource/program";
import { getResultAsync, MAX_READ_LIMIT, noop } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const programStore = useProgramStore();
const { loadContent, saveProgram } = programStore;
const { programResource } = storeToRefs(programStore);
const audience = computed({
  get: () => programResource.value.audience ?? undefined,
  set: (value) => {
    programResource.value.audience = value ?? null;
  },
});
const { dataset } = useDataset(audience);
// The key column can only be one the audience actually has, so it is picked, never typed
const keyColumnItems = computed<UiSelectItem<string>[]>(
  () => dataset.value?.columns.map(({ name }) => ({ meaning: UiIconMeaning.Columns, title: name, value: name })) ?? [],
);
const emailItems = ref<UiSelectItem<string>[]>([]);
const surveyItems = ref<UiSelectItem<string>[]>([]);
await loadContent();
// Both binding pickers are independent of each other, so they resolve together
await getResultAsync(async () => {
  const [emails, surveys] = await Promise.all([
    $trpc.email.readResources.query({ limit: MAX_READ_LIMIT }),
    $trpc.survey.readResources.query({ limit: MAX_READ_LIMIT }),
  ]);
  emailItems.value = emails.items.map(({ id, name }) => ({ meaning: UiIconMeaning.Email, title: name, value: id }));
  surveyItems.value = surveys.items.map(({ id, name }) => ({ meaning: UiIconMeaning.Survey, title: name, value: id }));
}).match(noop, console.error);
// Autosave binding edits — registered after the load, so the hydration itself never reaches the watcher
watchAutosave(programResource, saveProgram);
</script>

<template>
  <div p-4 flex flex-col gap-4 ui-body>
    <h2 ui-heading>Audience</h2>
    <DatasetReferencePicker v-model="audience" />
    <div flex flex-col gap-1 w-64>
      <span text-muted>Key column</span>
      <UiSelect
        v-model="programResource.keyColumn"
        :items="[{ meaning: UiIconMeaning.None, title: 'None', value: '' }, ...keyColumnItems]"
        label="Key column"
      />
    </div>
    <h2 ui-heading>Bindings</h2>
    <div flex flex-wrap gap-3>
      <div flex flex-col gap-1 w-64>
        <span text-muted>Email</span>
        <UiSelect
          v-model="programResource.emailId"
          :items="[{ meaning: UiIconMeaning.None, title: 'None', value: '' }, ...emailItems]"
          label="Email"
        />
      </div>
      <div flex flex-col gap-1 w-64>
        <span text-muted>Survey</span>
        <UiSelect
          v-model="programResource.surveyId"
          :items="[{ meaning: UiIconMeaning.None, title: 'None', value: '' }, ...surveyItems]"
          label="Survey"
        />
      </div>
    </div>
  </div>
</template>
