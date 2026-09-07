<script setup lang="ts">
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

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
const keyColumns = computed<SelectItemCategoryDefinition<string>[]>(
  () => dataset.value?.columns.map(({ name }) => ({ title: name, value: name })) ?? [],
);
const emailIds = ref<SelectItemCategoryDefinition<string>[]>([]);
const surveyIds = ref<SelectItemCategoryDefinition<string>[]>([]);
await loadContent();
// Both binding pickers are independent of each other, so they resolve together
await getResultAsync(async () => {
  const [emails, surveys] = await Promise.all([
    $trpc.email.readResources.query({ limit: MAX_READ_LIMIT }),
    $trpc.survey.readResources.query({ limit: MAX_READ_LIMIT }),
  ]);
  emailIds.value = emails.items.map(({ id, name }) => ({ title: name, value: id }));
  surveyIds.value = surveys.items.map(({ id, name }) => ({ title: name, value: id }));
}).match(noop, console.error);
// Autosave binding edits — registered after the load, so the hydration itself never reaches the watcher
watchAutosave(programResource, saveProgram);
</script>

<template>
  <div p-6 flex flex-col gap-4 max-w-xl>
    <span text-title-large>Audience</span>
    <div flex flex-wrap gap-4>
      <DatasetReferencePicker v-model="audience" />
    </div>
    <v-select v-model="programResource.keyColumn" max-width="16rem" :items="keyColumns" label="Key column" />
    <span text-title-large>Bindings</span>
    <v-select v-model="programResource.emailId" max-width="16rem" :items="emailIds" label="Email" />
    <v-select v-model="programResource.surveyId" max-width="16rem" :items="surveyIds" label="Survey" />
  </div>
</template>
