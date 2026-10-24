<script setup lang="ts">
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";
import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { authClient } from "@/services/auth/authClient";
import { DatasetProviderTypeIconMeaningMap } from "@/services/dataset/DatasetProviderTypeIconMeaningMap";
import { DatasetProviderTypeItemCategoryDefinitions } from "@/services/dataset/DatasetProviderTypeItemCategoryDefinitions";
import { DatasetProviderTypeSourceRouterMap } from "@/services/dataset/DatasetProviderTypeSourceRouterMap";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { prependNoneSelectItem } from "@/services/ui/prependNoneSelectItem";
import { getResultAsync, MAX_READ_LIMIT, noop } from "@esposter/shared";

interface Props {
  // Why the picked source could not be read, from the consumer's own read of it
  error: string;
}

const { error } = defineProps<Props>();
const modelValue = defineModel<DatasetReference | undefined>({ required: true });
const { $trpc } = useNuxtApp();
const session = authClient.useSession();
const type = ref(modelValue.value?.type ?? DatasetProviderType.SurveyResponses);
// Every provider type lists its sources the one way, a page of its router's resources
const readSources = async (providerType: DatasetProviderType): Promise<{ id: string; name: string }[]> => {
  const { items } = await $trpc[DatasetProviderTypeSourceRouterMap[providerType]].readResources.query({
    limit: MAX_READ_LIMIT,
  });
  return items;
};
// Filed under the provider type they were read for rather than in one list, because a read of the type left behind
// Can land after the one picked now: listed under it, a survey would be offered as a sheet, and picking it would bind
// That id under the type on screen
const typeSourceItemsMap = ref(new Map<DatasetProviderType, UiSelectItem<string>[]>());
const sourceItems = computed(() => typeSourceItemsMap.value.get(type.value) ?? []);

watchImmediate([() => session.value.data, type], async ([newSession, newType]) => {
  if (!newSession) return;
  await getResultAsync(async () => {
    const sources = await readSources(newType);
    typeSourceItemsMap.value.set(
      newType,
      sources.map(({ id, name }) => ({ meaning: DatasetProviderTypeIconMeaningMap[newType], title: name, value: id })),
    );
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
        :items="prependNoneSelectItem(sourceItems)"
        label="Source"
        :model-value="modelValue?.id ?? ''"
        @update:model-value="modelValue = $event ? { id: $event, type } : undefined"
      />
      <span v-if="error" role="alert" text-sm text-error>{{ error }}</span>
    </div>
  </div>
</template>
