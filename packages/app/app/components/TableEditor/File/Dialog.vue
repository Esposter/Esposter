<script setup lang="ts">
import type { CsvColumn } from "#shared/models/tableEditor/file/CsvColumn";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { CsvDataSourceItem } from "#shared/models/tableEditor/file/CsvDataSourceItem";
import { CsvParser } from "@/models/tableEditor/file/parsers/CsvParser";
import { formComponentMap } from "@/services/tableEditor/file/formComponentMap";
import { useFileTableEditorStore } from "@/store/tableEditor/file";

interface DialogProps {
  dataSourceType: DataSourceType;
}

const { dataSourceType } = defineProps<DialogProps>();
const modelValue = defineModel<boolean>();
const store = useFileTableEditorStore();
const file = ref<File | null>(null);
const csvItem = ref(new CsvDataSourceItem());
// Fix this up
const formRef = ref<null | { accept?: string }>(null);
const previewDataSource = ref<DataSource | null>(null);
const formComponent = computed(() => formComponentMap[dataSourceType]);
const accept = computed(() => formRef.value?.accept);
const columnHeaders = [
  { key: "sourceName", title: "Source Field" },
  { key: "name", title: "Name" },
  { key: "type", title: "Type" },
];

watch(file, async (newFile) => {
  if (!newFile) {
    previewDataSource.value = null;
    return;
  }
  previewDataSource.value = await new CsvParser().parse(newFile, csvItem.value);
});
</script>

<template>
  <StyledDialog
    v-model="modelValue"
    :card-props="{ title: `Import ${dataSourceType}` }"
    :confirm-button-props="{ disabled: !previewDataSource, text: 'Import' }"
    @submit="
      (_event, onComplete) => {
        if (previewDataSource) store.setDataSource(previewDataSource);
        onComplete();
      }
    "
  >
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-file-input
            :accept
            :label="`Select ${dataSourceType} file`"
            density="compact"
            hide-details
            @update:model-value="file = Array.isArray($event) ? ($event[0] ?? null) : ($event ?? null)"
          />
        </v-col>
        <v-col v-if="formComponent" cols="12">
          <component :is="formComponent" ref="formRef" v-model="csvItem" />
        </v-col>
        <v-col v-if="previewDataSource" cols="12">
          <v-data-table
            :headers="columnHeaders"
            :items="previewDataSource.columns as CsvColumn[]"
            density="compact"
            hide-default-footer
          >
            <template #[`item.type`]="{ item }">
              <v-chip :color="item.type === ColumnType.String ? undefined : 'primary'" label size="small">
                {{ item.type }}
              </v-chip>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </StyledDialog>
</template>
