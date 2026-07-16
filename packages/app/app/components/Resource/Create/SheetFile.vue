<script setup lang="ts">
import type { SheetResource } from "#shared/models/resource/sheet/SheetResource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { DataSourceTypes } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { SHEET_IMPORT_PREVIEW_ROW_COUNT } from "@/services/resource/constants";
import { createDefaultSheetSettings } from "@/services/resource/sheet/createDefaultSheetSettings";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { getDataSourceTypeByFileName } from "@/services/resource/sheet/dataSource/getDataSourceTypeByFileName";
import { trimFileExtension } from "@/util/file/trimFileExtension";
import { getResultAsync, normalizeString, takeOne } from "@esposter/shared";

// The parsed content the create form saves right after createResource — unset while the form is name-only
const sheetResource = defineModel<SheetResource>();
// Surfaced to the form rather than kept here, because a file that failed to parse has to block Create
const error = defineModel<string>("error", { default: "" });
// The filename is the best name the user never has to type, so the form takes it as its own
const emit = defineEmits<{ parse: [name: string] }>();
const accept = DataSourceTypes.map((type) => DataSourceConfigurationMap[type].accept).join(",");
const dropZone = useTemplateRef("dropZone");
const file = ref<File>();
const isParsing = ref(false);
const previewHeaders = computed(
  () =>
    sheetResource.value?.data.columns.map(({ name }) => ({
      key: name,
      title: name,
      value: (row: Row) => takeOne(row.data, name),
    })) ?? [],
);
const previewRows = computed(() => sheetResource.value?.data.rows.slice(0, SHEET_IMPORT_PREVIEW_ROW_COUNT) ?? []);
const parseFile = async (newFile: File) => {
  file.value = newFile;
  sheetResource.value = undefined;
  const type = getDataSourceTypeByFileName(newFile.name);
  if (!type) {
    error.value = `${newFile.name} is not a ${accept} file`;
    return;
  }

  const settings = createDefaultSheetSettings(type);
  isParsing.value = true;
  error.value = "";
  await getResultAsync(() => DataSourceConfigurationMap[type].deserialize(newFile, settings)).match(
    (data) => {
      sheetResource.value = { data, settings };
      emit("parse", normalizeString(trimFileExtension(newFile.name)));
    },
    (parseError) => {
      error.value = parseError.message;
    },
  );
  isParsing.value = false;
};
// Dropping is the whole point of the zone, so it parses through the same path the picker does
const { isOverDropZone } = useDropZone(dropZone, {
  dataTypes: (types) => types.length > 0,
  onDrop: async (files) => {
    if (files && files.length > 0) await parseFile(takeOne(files));
  },
});
// The picker hands back a lone file or a list depending on `multiple`, and the template has no File global
const onUpdateFile = async (newFile: File | File[]) => {
  const newFiles = Array.isArray(newFile) ? newFile : [newFile];
  if (newFiles.length > 0) await parseFile(takeOne(newFiles));
};
</script>

<template>
  <div ref="dropZone" flex flex-col gap-2 rd b-2 b-dashed p-4 :b-primary="isOverDropZone" :b-border="!isOverDropZone">
    <span op-medium-emphasis text-caption>
      Drop a {{ accept }} file here, or pick one — the rows land in the new sheet's Data blade. Optional.
    </span>
    <v-file-input
      :accept
      density="comfortable"
      hide-details="auto"
      label="File"
      :error-messages="error"
      :loading="isParsing"
      :model-value="file"
      prepend-icon=""
      prepend-inner-icon="mdi-paperclip"
      @update:model-value="onUpdateFile"
    />
    <template v-if="sheetResource">
      <span op-medium-emphasis text-caption>
        Preview — first {{ previewRows.length }} of {{ sheetResource.data.rows.length }} rows
      </span>
      <v-data-table density="compact" hide-default-footer :headers="previewHeaders" :items="previewRows" />
    </template>
  </div>
</template>
