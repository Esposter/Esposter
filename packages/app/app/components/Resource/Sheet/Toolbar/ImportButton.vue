<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";

import { authClient } from "@/services/auth/authClient";
import { createDefaultSheetSettings } from "@/services/resource/sheet/createDefaultSheetSettings";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { DataSourceTypeItemCategoryDefinitions } from "@/services/resource/sheet/dataSource/DataSourceTypeItemCategoryDefinitions";
import { useSheetStore } from "@/store/resource/sheet";
import { trimFileExtension } from "@/util/file/trimFileExtension";

const session = authClient.useSession();
const sheetStore = useSheetStore();
const { settings } = storeToRefs(sheetStore);
const setDataSource = useSetDataSource();
const importFile = useImportFile();
const previewDataSource = ref<DataSource | undefined>();
const pendingName = ref("");
const isDatasetDialogOpen = ref(false);
const isPreviewOpen = computed({
  get: () => Boolean(previewDataSource.value),
  set: (newIsPreviewOpen) => {
    if (!newIsPreviewOpen) previewDataSource.value = undefined;
  },
});
// The menu names the format, so importing no longer depends on the type set in the Settings tab — and, like the
// Export dialog it mirrors, a format other than the sheet's own is read with that format's default settings
// Rather than rewriting the settings the sheet already has
const importDataSourceType = (type: DataSourceType) => {
  const configuration = DataSourceConfigurationMap[type];
  const importSettings = settings.value.type === type ? settings.value : createDefaultSheetSettings(type);
  return importFile(configuration.mimeType, configuration.accept, async (file) => {
    const result = await configuration.deserialize(file, importSettings);
    pendingName.value = trimFileExtension(result.metadata.name);
    previewDataSource.value = result;
  });
};
</script>

<template>
  <StyledTooltipMenuIconButton icon="mdi-upload" text="Import">
    <v-list>
      <v-list-item
        v-for="{ value, icon, title } of DataSourceTypeItemCategoryDefinitions"
        :key="value"
        @click="importDataSourceType(value)"
      >
        <v-icon :icon />
        {{ title }}
      </v-list-item>
      <!-- A survey is a source rather than a file format, so it sits below the divider — but it is still an
        import, and a peer icon button of its own only made the toolbar read as two unrelated actions -->
      <template v-if="session.data">
        <v-divider />
        <v-list-item @click="isDatasetDialogOpen = true">
          <v-icon icon="mdi-poll" />
          Survey responses
        </v-list-item>
      </template>
    </v-list>
  </StyledTooltipMenuIconButton>
  <StyledDialog
    v-model="isPreviewOpen"
    :card-props="{ title: `Preview: ${pendingName}` }"
    :confirm-button-props="{ text: 'Import' }"
    @confirm="
      async (onComplete) => {
        if (previewDataSource) await setDataSource(previewDataSource);
        onComplete();
      }
    "
  >
    <ResourceSheetPreviewTable v-if="previewDataSource" :data-source="previewDataSource" />
  </StyledDialog>
  <ResourceSheetToolbarImportDatasetDialog v-model="isDatasetDialogOpen" />
</template>
