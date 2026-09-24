<script setup lang="ts">
import type { SheetResource } from "#shared/models/resource/sheet/SheetResource";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { createDefaultSheetSettings } from "@/services/resource/sheet/createDefaultSheetSettings";
import { DATA_SOURCE_ACCEPT, DATA_SOURCE_ACCEPTS } from "@/services/resource/sheet/dataSource/constants";
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
const dropZone = useTemplateRef("dropZone");
const fileInput = useTemplateRef("fileInput");
const file = ref<File>();
const parseFile = async (newFile: File) => {
  file.value = newFile;
  sheetResource.value = undefined;
  const type = getDataSourceTypeByFileName(newFile.name);
  if (!type) {
    error.value = `${newFile.name} is not a ${DATA_SOURCE_ACCEPTS.join(" or ")} file`;
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
  <div ref="dropZone" class="drop-zone" :data-over="isOverDropZone || undefined" p-4 flex flex-col gap-3 ui-sunk>
    <p text-muted>
      Drop a {{ DATA_SOURCE_ACCEPT }} file here, or pick one — the rows land in the new sheet's Data blade. Optional.
    </p>
    <div flex flex-wrap gap-2 items-center>
      <input
        ref="fileInput"
        :accept="DATA_SOURCE_ACCEPT"
        aria-label="File"
        type="file"
        sr-only
        @change="onUpdateFile(fileInput?.files?.[0])"
      />
      <UiButton @click="fileInput?.click()">
        <span class="i-mdi:paperclip" aria-hidden="true" size-5 />
        {{ file ? "Choose another file" : "Choose a file" }}
      </UiButton>
      <span v-if="file" truncate>{{ file.name }}</span>
      <UiSpinner v-if="isParsing" />
      <UiIconButton
        v-if="file && !isParsing"
        label="Remove file"
        :meaning="UiIconMeaning.Remove"
        :variant="UiButtonVariant.Quiet"
        @click="
          async () => {
            if (fileInput) fileInput.value = '';
            await onUpdateFile();
          }
        "
      />
    </div>
    <p v-if="error" role="alert" text-error>{{ error }}</p>
    <ResourceSheetPreviewTable v-if="sheetResource" :data-source="sheetResource.data" />
  </div>
</template>

<style scoped>
/* A file held over the zone lights its edge in the accent, where it will land */
.drop-zone[data-over] {
  box-shadow: inset 0 0 0 var(--ui-step) var(--ui-accent);
}
</style>
