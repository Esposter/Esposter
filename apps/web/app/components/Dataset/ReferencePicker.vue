<script setup lang="ts">
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { authClient } from "@/services/auth/authClient";
import { DatasetProviderTypeItemCategoryDefinitions } from "@/services/dataset/DatasetProviderTypeItemCategoryDefinitions";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { getResultAsync, MAX_READ_LIMIT, noop } from "@esposter/shared";

const modelValue = defineModel<DatasetReference | undefined>({ required: true });
const { $trpc } = useNuxtApp();
const session = authClient.useSession();
const type = ref(modelValue.value?.type ?? DatasetProviderType.SurveyResponses);
const datasetProviderTypeSourceReaderMap: Record<DatasetProviderType, () => Promise<{ id: string; name: string }[]>> = {
  [DatasetProviderType.ProgramStatus]: async () =>
    (await $trpc.program.readResources.query({ limit: MAX_READ_LIMIT })).items,
  [DatasetProviderType.Sheet]: async () => (await $trpc.sheet.readResources.query({ limit: MAX_READ_LIMIT })).items,
  [DatasetProviderType.SurveyResponses]: async () =>
    (await $trpc.survey.readResources.query({ limit: MAX_READ_LIMIT })).items,
};
const sourceIds = ref<SelectItemCategoryDefinition<string>[]>([]);

watchImmediate([() => session.value.data, type], async ([newSession, newType]) => {
  if (!newSession) return;
  await getResultAsync(async () => {
    sourceIds.value = (await datasetProviderTypeSourceReaderMap[newType]()).map(({ id, name }) => ({
      title: name,
      value: id,
    }));
  }).match(noop, createErrorAlert);
});
</script>

<template>
  <v-select
    v-model="type"
    max-width="16rem"
    :items="DatasetProviderTypeItemCategoryDefinitions"
    label="Data source"
    @update:model-value="modelValue = undefined"
  />
  <v-select
    max-width="16rem"
    :items="sourceIds"
    label="Source"
    :model-value="modelValue?.id"
    clearable
    @update:model-value="modelValue = $event ? { id: $event, type } : undefined"
  />
</template>
