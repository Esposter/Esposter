<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { createDefaultSheetSettings } from "@/services/resource/sheet/createDefaultSheetSettings";
import {
  DataSourceTypeItemCategoryDefinitionMap,
  DataSourceTypeItemCategoryDefinitions,
} from "@/services/resource/sheet/dataSource/DataSourceTypeItemCategoryDefinitionMap";
import { useSheetStore } from "@/store/resource/sheet";

const sheetStore = useSheetStore();
const { loadContent, saveSheet } = sheetStore;
const { settings, sheetResource } = storeToRefs(sheetStore);
const configuration = useDataSourceConfiguration(settings);
const schema = computed(() => zodToJsonSchema(configuration.value.schema));
// A format such as JSON reads every file the same way, so its card says so rather than standing empty
const hasOptions = computed(() => Object.keys(schema.value.properties ?? {}).length > 0);
const isLoading = ref(true);
// Autosave settings edits; the store's dirty check drops the load echo, so no loading guard is needed here
// (a guard could not work anyway — the debounced callback fires after loading has already finished)
watchAutosave(settings, saveSheet);

onMounted(async () => {
  await loadContent();
  isLoading.value = false;
});
</script>

<!-- The format on one side and what that format asks on the other, so a wide blade reads as the choice and its
  consequence side by side, and a narrow one stacks them in that order -->
<template>
  <div p-4 gap-4 grid items-start ui-body md:cols-2>
    <UiFrame title="File type">
      <p text-muted>How the next import reads a file, and the format an export starts from.</p>
      <div v-if="isLoading" flex flex-col gap-2>
        <UiSkeleton v-for="index of DataSourceTypeItemCategoryDefinitions.length" :key="index" h-12 />
      </div>
      <!-- Changing the type swaps in that format's default configuration; the data section is untouched (settings
        re-parse on the next import, never silently rewrite data) -->
      <UiRadioGroup
        v-else
        :items="DataSourceTypeItemCategoryDefinitions"
        label="File type"
        :model-value="settings.type"
        @update:model-value="
          (type) => {
            if (type) sheetResource.settings = createDefaultSheetSettings(type);
          }
        "
      />
    </UiFrame>
    <UiFrame :title="isLoading ? 'Options' : `${DataSourceTypeItemCategoryDefinitionMap[settings.type].title} options`">
      <div v-if="isLoading" flex flex-col gap-2>
        <UiSkeleton h-4 w="1/4" />
        <UiSkeleton h-8 />
      </div>
      <UiSchemaForm
        v-else-if="hasOptions"
        v-model="settings.configuration"
        :schema
        :validation-schema="configuration.schema"
      />
      <UiEmptyState
        v-else
        description="Every file of this type is read the same way."
        :meaning="UiIconMeaning.Settings"
        title="Nothing to set"
      />
    </UiFrame>
    <p text-sm text-muted flex gap-2 items-center md:col-span-2>
      <UiIcon :meaning="UiIconMeaning.Info" />
      Changes save as you make them, and apply the next time a file is imported. The data already here stays as it is.
    </p>
  </div>
</template>
