<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { CsvDataSourceItem } from "#shared/models/tableEditor/file/CsvDataSourceItem";
import { CsvParser } from "@/models/tableEditor/file/parsers/CsvParser";
import { CsvColumnHeaders } from "@/services/tableEditor/file/CsvColumnHeaders";
import { formComponentMap } from "@/services/tableEditor/file/formComponentMap";
import { useFileTableEditorStore } from "@/store/tableEditor/file";

interface DialogProps {
  dataSourceType: DataSourceType;
}

const { dataSourceType } = defineProps<DialogProps>();
const modelValue = defineModel<boolean>();
const store = useFileTableEditorStore();
const { dataSource } = storeToRefs(store);
const file = ref<File | null>(null);
// Fix this up
const formRef = ref<null | { accept?: string }>(null);
const formComponent = computed(() => formComponentMap[dataSourceType]);
const accept = computed(() => formRef.value?.accept);
</script>

<template>
  <StyledDialog
    :card-props="{ title: dataSourceType }"
    @submit="
      (_event, onComplete) => {
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
          <component :is="formComponent" ref="formRef" v-model="modelValue" />
        </v-col>
        <v-col cols="12">
          <v-data-table :headers="CsvColumnHeaders" :items="dataSource.columns" density="compact" hide-default-footer>
            <template #[`item.type`]="{ item: column }">
              <v-chip :color="column.type === ColumnType.String ? undefined : 'primary'" label size="small">
                {{ column.type }}
              </v-chip>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </StyledDialog>
</template>
