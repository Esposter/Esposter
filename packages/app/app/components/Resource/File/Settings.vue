<script setup lang="ts">
import type { DataSourceType } from "#shared/models/resource/file/datasource/DataSourceType";

import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { createDefaultFileSettings } from "@/services/resource/file/createDefaultFileSettings";
import { DataSourceTypeItemCategoryDefinitions } from "@/services/resource/file/dataSource/DataSourceTypeItemCategoryDefinitions";
import { useFileStore } from "@/store/resource/file";
import { Vjsf } from "@koumoul/vjsf";

const fileStore = useFileStore();
const { loadContent, saveFile } = fileStore;
const { settings } = storeToRefs(fileStore);
const configuration = useDataSourceConfiguration(settings);
const schema = computed(() => zodToJsonSchema(configuration.value.schema));
const isLoading = ref(true);
// Changing the type swaps in that format's default configuration; the data section is untouched
// (settings re-parse on the next import, never silently rewrite data)
const onUpdateType = (type: DataSourceType) => {
  fileStore.fileResource.settings = createDefaultFileSettings(type);
};

// Autosave settings edits; guarded so the initial load populating the store does not write back
watchDebounced(
  settings,
  async () => {
    if (isLoading.value) return;
    await saveFile();
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
