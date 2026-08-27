<script setup lang="ts">
import type { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";

import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { createDefaultSheetSettings } from "@/services/resource/sheet/createDefaultSheetSettings";
import { DataSourceTypeItemCategoryDefinitions } from "@/services/resource/sheet/dataSource/DataSourceTypeItemCategoryDefinitions";
import { useSheetStore } from "@/store/resource/sheet";
import { Vjsf } from "@koumoul/vjsf";

const sheetStore = useSheetStore();
const { loadContent, saveSheet } = sheetStore;
const { settings, sheetResource } = storeToRefs(sheetStore);
const configuration = useDataSourceConfiguration(settings);
const schema = computed(() => zodToJsonSchema(configuration.value.schema));
const isLoading = ref(true);
// Changing the type swaps in that format's default configuration; the data section is untouched
// (settings re-parse on the next import, never silently rewrite data)
const onUpdateType = (type: DataSourceType) => {
  if (sheetResource.value) sheetResource.value.settings = createDefaultSheetSettings(type);
};
// Autosave settings edits; the store's dirty check drops the load echo, so no loading guard is needed here
// (a guard could not work anyway — the debounced callback fires after loading has already finished)
watchAutosave(settings, saveSheet);

onMounted(async () => {
  await loadContent();
  isLoading.value = false;
});
</script>

<template>
  <StyledSkeleton v-if="isLoading" />
  <div v-else p-6 flex flex-col gap-4 max-w-xl>
    <v-select
      label="Type"
      :items="DataSourceTypeItemCategoryDefinitions"
      :model-value="settings.type"
      @update:model-value="onUpdateType"
    />
    <Vjsf v-model="settings.configuration" :schema />
  </div>
</template>
