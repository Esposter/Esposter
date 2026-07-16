<script setup lang="ts">
import type { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";

import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { createDefaultSheetSettings } from "@/services/resource/sheet/createDefaultSheetSettings";
import { DataSourceTypeItemCategoryDefinitions } from "@/services/resource/sheet/dataSource/DataSourceTypeItemCategoryDefinitions";
import { useSheetStore } from "@/store/resource/sheet";
import { Vjsf } from "@koumoul/vjsf";

const sheetStore = useSheetStore();
const { loadContent, saveSheet } = sheetStore;
const { settings } = storeToRefs(sheetStore);
const configuration = useDataSourceConfiguration(settings);
const schema = computed(() => zodToJsonSchema(configuration.value.schema));
const isLoading = ref(true);
// Changing the type swaps in that format's default configuration; the data section is untouched
// (settings re-parse on the next import, never silently rewrite data)
const onUpdateType = (type: DataSourceType) => {
  sheetStore.sheetResource.settings = createDefaultSheetSettings(type);
};

// Autosave settings edits; guarded so the initial load populating the store does not write back
watchDebounced(
  settings,
  async () => {
    if (isLoading.value) return;
    await saveSheet();
  },
  { debounce: 500, deep: true },
);

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
      hide-details
      :items="DataSourceTypeItemCategoryDefinitions"
      :model-value="settings.type"
      @update:model-value="onUpdateType"
    />
    <Vjsf v-model="settings.configuration" :schema />
  </div>
</template>
