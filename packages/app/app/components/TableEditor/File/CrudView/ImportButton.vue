<script setup lang="ts" generic="TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { Row } from "#shared/models/tableEditor/file/Row";

import { trimFileExtension } from "@/util/trimFileExtension";
import { takeOne } from "@esposter/shared";

const modelValue = defineModel<TDataSourceItem>({ required: true });
const setDataSource = useSetDataSource();
const importFile = useImportFile();
const dataSourceConfiguration = useDataSourceConfiguration(modelValue);
const previewDataSource = ref<DataSource | null>(null);
const pendingName = ref("");
const isPreviewOpen = computed({
  get: () => previewDataSource.value !== null,
  set: (newIsPreviewOpen) => {
    if (!newIsPreviewOpen) previewDataSource.value = null;
  },
});
const previewHeaders = computed(
  () =>
    previewDataSource.value?.columns.map((column) => ({
      key: column.name,
      title: column.name,
      value: (row: Row) => takeOne(row.data, column.name),
    })) ?? [],
);
const previewRows = computed(() => previewDataSource.value?.rows.slice(0, 5) ?? []);
</script>

<template>
  <v-tooltip :text="`Import ${modelValue.type}`">
    <template #activator="{ props }">
      <v-btn
        icon="mdi-upload"
        :="props"
        @click="
          async () => {
            await importFile(dataSourceConfiguration.mimeType, dataSourceConfiguration.accept, async (file) => {
              const result = await dataSourceConfiguration.deserialize(file, modelValue);
              pendingName = trimFileExtension(result.metadata.name);
              previewDataSource = result;
            });
          }
        "
      />
    </template>
  </v-tooltip>
  <StyledDialog
    v-model="isPreviewOpen"
    :card-props="{ title: `Preview: ${pendingName}` }"
    :confirm-button-props="{ text: 'Import' }"
    @confirm="
      (onComplete) => {
        if (previewDataSource) {
          modelValue.name = pendingName;
          setDataSource(previewDataSource);
        }
        onComplete();
      }
    "
  >
    <v-card-text>
      <v-data-table density="compact" hide-default-footer :headers="previewHeaders" :items="previewRows" />
    </v-card-text>
  </StyledDialog>
</template>
