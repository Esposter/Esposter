<script setup lang="ts">
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";
import type { UiSelectItem } from "#src/models/ui/UiSelectItem";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { authClient } from "#src/services/auth/authClient";
import { DatasetProviderTypeIconMeaningMap } from "#src/services/dataset/DatasetProviderTypeIconMeaningMap";
import { DatasetProviderTypeItemCategoryDefinitions } from "#src/services/dataset/DatasetProviderTypeItemCategoryDefinitions";
import { DatasetProviderTypeSourceRouterMap } from "#src/services/dataset/DatasetProviderTypeSourceRouterMap";
import { readAllResourcePages } from "#src/services/resource/readAllResourcePages";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { prependNoneSelectItem } from "#src/services/ui/prependNoneSelectItem";
import { getResultAsync, noop } from "@esposter/shared";

interface Props {
  // Why the picked source could not be read, from the consumer's own read of it
  error: string;
}

const modelValue = defineModel<DatasetReference | undefined>({ required: true });
defineProps<Props>();
const { $trpc } = useNuxtApp();
const session = authClient.useSession();
const type = ref(modelValue.value?.type ?? DatasetProviderType.SurveyResponses);
// Every provider type lists its sources the one way: every page of its router's resources, read to the end so none is
// Left out of the list
const readSources = (providerType: DatasetProviderType) =>
  readAllResourcePages((cursor) =>
    $trpc[DatasetProviderTypeSourceRouterMap[providerType]].readResources.query({ cursor }),
  );
// Filed under the provider type they were read for rather than in one list, because a read of the type left behind
// Can land after the one picked now: listed under it, a survey would be offered as a sheet, and picking it would bind
// That id under the type on screen
const typeSourceItemsMap = ref(new Map<DatasetProviderType, UiSelectItem<string>[]>());
const sourceSelectItems = computed(() => prependNoneSelectItem(typeSourceItemsMap.value.get(type.value) ?? []));

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
        :items="sourceSelectItems"
        label="Source"
        :model-value="modelValue?.id ?? ''"
        @update:model-value="modelValue = $event ? { id: $event, type } : undefined"
      />
      <span v-if="error" role="alert" text-sm text-error>{{ error }}</span>
    </div>
  </div>
</template>
