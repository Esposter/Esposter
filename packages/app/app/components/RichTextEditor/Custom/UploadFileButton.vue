<script setup lang="ts">
import { pickFiles } from "@/services/file/pickFiles";

const emit = defineEmits<{ "upload-file": [files: File[]] }>();
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ size: 'small' }"
    icon="mdi-plus"
    text="Upload a File"
    @click="
      async () => {
        const files = await pickFiles();
        if (files.length > 0) emit('upload-file', files);
      }
    "
  />
</template>
