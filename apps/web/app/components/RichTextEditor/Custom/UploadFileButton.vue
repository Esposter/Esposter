<script setup lang="ts">
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { pickFiles } from "#src/services/file/pickFiles";

const emit = defineEmits<{ "upload-file": [files: File[]] }>();
</script>

<template>
  <UiIconButton
    label="Upload a file"
    :meaning="UiIconMeaning.Upload"
    @click="
      async () => {
        const files = await pickFiles();
        if (files.length > 0) emit('upload-file', files);
      }
    "
  />
</template>
