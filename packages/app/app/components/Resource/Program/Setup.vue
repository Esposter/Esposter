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
const isLoading = ref(true);

// Autosave binding edits; guarded so the initial load populating the store does not write back
watchDebounced(
  programResource,
  async () => {
    if (isLoading.value) return;
    await saveProgram();
  },
  { debounce: 500, deep: true },
);

onMounted(async () => {
  await loadContent();
  await getResultAsync(async () => {
    const [emails, surveys] = await Promise.all([
      $trpc.email.readResources.query({ limit: MAX_READ_LIMIT }),
      $trpc.survey.readResources.query({ limit: MAX_READ_LIMIT }),
    ]);
    emailIds.value = emails.items.map(({ id, name }) => ({ title: name, value: id }));
    surveyIds.value = surveys.items.map(({ id, name }) => ({ title: name, value: id }));
  }).match(noop, console.error);
  isLoading.value = false;
});
</script>

<template>
  <StyledSkeleton v-if="isLoading" />
  <div v-else p-6 flex flex-col gap-4 max-w-xl>
    <span text-h6>Audience</span>
    <div flex flex-wrap gap-4>
      <DatasetReferencePicker v-model="audience" />
    </div>
    <v-select
      v-model="programResource.keyColumn"
      max-width="16rem"
      :items="keyColumns"
      label="Key column"
      hide-details
    />
    <span text-h6>Bindings</span>
    <v-select v-model="programResource.emailId" max-width="16rem" :items="emailIds" label="Email" hide-details />
    <v-select v-model="programResource.surveyId" max-width="16rem" :items="surveyIds" label="Survey" hide-details />
  </div>
</template>
