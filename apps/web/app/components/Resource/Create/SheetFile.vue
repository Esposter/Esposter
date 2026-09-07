<script setup lang="ts">
import type { SheetResource } from "#shared/models/resource/sheet/SheetResource";

import { DataSourceTypes } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { createDefaultSheetSettings } from "@/services/resource/sheet/createDefaultSheetSettings";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { getDataSourceTypeByFileName } from "@/services/resource/sheet/dataSource/getDataSourceTypeByFileName";
import { trimFileExtension } from "@/util/file/trimFileExtension";
import { getResultAsync, normalizeString, takeOne } from "@esposter/shared";

// The parsed content the create form saves right after createResource — unset while the form is name-only
const sheetResource = defineModel<SheetResource>();
// Surfaced to the form rather than kept here, because a file that failed to parse has to block Create
const error = defineModel<string>("error", { default: "" });
// Surfaced too — submitting mid-parse would create an empty sheet and silently discard the import
const isParsing = defineModel<boolean>("isParsing", { default: false });
// The filename is the best name the user never has to type, so the form takes it as its own
const emit = defineEmits<{ parse: [name: string] }>();
const ACCEPTS = DataSourceTypes.map((type) => DataSourceConfigurationMap[type].accept);
const ACCEPT = ACCEPTS.join(",");
const dropZone = useTemplateRef("dropZone");
const file = ref<File>();
const parseFile = async (newFile: File) => {
  file.value = newFile;
  sheetResource.value = undefined;
  const type = getDataSourceTypeByFileName(newFile.name);
  if (!type) {
    error.value = `${newFile.name} is not a ${ACCEPTS.join(" or ")} file`;
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
// The picker hands back a lone file or a list depending on `multiple`, and clearing it hands back nothing,
// Which resets the staged sheet along with the selection
const onUpdateFile = async (newFile?: File | File[]) => {
  const newFiles = Array.isArray(newFile) ? newFile : newFile ? [newFile] : [];
  if (newFiles.length > 0) await parseFile(takeOne(newFiles));
  else {
    file.value = undefined;
    sheetResource.value = undefined;
    error.value = "";
  }
};
</script>

<template>
  <div ref="dropZone" p-4 b-2 rd b-dashed flex flex-col gap-2 :class="isOverDropZone ? 'b-primary' : 'b-border'">
    <span text-hint>
      Drop a {{ ACCEPT }} file here, or pick one — the rows land in the new sheet's Data blade. Optional.
    </span>
    <v-file-input
      :accept="ACCEPT"
      density="comfortable"
      label="File"
      :error-messages="error"
      :loading="isParsing"
      :model-value="file"
      prepend-icon=""
      prepend-inner-icon="mdi-paperclip"
      @update:model-value="onUpdateFile"
    />
    <ResourceSheetPreviewTable v-if="sheetResource" :data-source="sheetResource.data" />
  </div>
</template>
