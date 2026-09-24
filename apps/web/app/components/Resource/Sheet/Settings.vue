<script setup lang="ts">
import type { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";

import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { createDefaultSheetSettings } from "@/services/resource/sheet/createDefaultSheetSettings";
import { DataSourceTypeItemCategoryDefinitions } from "@/services/resource/sheet/dataSource/DataSourceTypeItemCategoryDefinitionMap";
import { useSheetStore } from "@/store/resource/sheet";

const sheetStore = useSheetStore();
const { loadContent, saveSheet } = sheetStore;
const { settings, sheetResource } = storeToRefs(sheetStore);
const configuration = useDataSourceConfiguration(settings);
const schema = computed(() => zodToJsonSchema(configuration.value.schema));
const isLoading = ref(true);
// Autosave settings edits; the store's dirty check drops the load echo, so no loading guard is needed here
// (a guard could not work anyway — the debounced callback fires after loading has already finished)
watchAutosave(settings, saveSheet);

onMounted(async () => {
  await loadContent();
  isLoading.value = false;
});
</script>

<template>
  <!-- The settings' own shape while they load: the type's field, then the format's own fields under it -->
  <div v-if="isLoading" p-4 flex flex-col gap-4>
    <UiSkeleton v-for="index of 3" :key="index" h-8 w="1/3" />
  </div>
  <div v-else p-4 flex flex-col gap-4 ui-body>
    <div flex flex-col gap-1>
      <span text-sm text-muted>File type</span>
      <!-- Changing the type swaps in that format's default configuration; the data section is untouched (settings
        re-parse on the next import, never silently rewrite data) -->
      <UiSelect
        :items="DataSourceTypeItemCategoryDefinitions"
        label="File type"
        :model-value="settings.type"
        @update:model-value="(type: DataSourceType) => (sheetResource.settings = createDefaultSheetSettings(type))"
      />
    </div>
    <UiSchemaForm v-model="settings.configuration" :schema :validation-schema="configuration.schema" />
  </div>
</template>
