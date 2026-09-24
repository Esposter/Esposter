<script setup lang="ts">
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";
import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { authClient } from "@/services/auth/authClient";
import { DatasetProviderTypeIconMeaningMap } from "@/services/dataset/DatasetProviderTypeIconMeaningMap";
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
const sourceItems = ref<UiSelectItem<string>[]>([]);

watchImmediate([() => session.value.data, type], async ([newSession, newType]) => {
  if (!newSession) return;
  await getResultAsync(async () => {
    sourceItems.value = (await datasetProviderTypeSourceReaderMap[newType]()).map(({ id, name }) => ({
      meaning: DatasetProviderTypeIconMeaningMap[newType],
      title: name,
      value: id,
    }));
  }).match(noop, createErrorAlert);
});
</script>

<template>
  <div flex flex-wrap gap-3 items-end>
    <div flex flex-col gap-1>
      <span text-sm text-muted>Data source</span>
      <UiSelect
        v-model="type"
        :items="DatasetProviderTypeItemCategoryDefinitions"
        label="Data source"
        @update:model-value="modelValue = undefined"
      />
    </div>
    <div flex flex-col gap-1>
      <span text-sm text-muted>Source</span>
      <UiSelect
        :items="[{ meaning: UiIconMeaning.None, title: 'None', value: '' }, ...sourceItems]"
        label="Source"
        :model-value="modelValue?.id ?? ''"
        @update:model-value="modelValue = $event ? { id: $event, type } : undefined"
      />
    </div>
  </div>
</template>
