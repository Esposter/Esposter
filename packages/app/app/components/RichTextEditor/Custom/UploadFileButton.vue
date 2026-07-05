<script setup lang="ts">
import { showOpenFilePicker } from "show-open-file-picker";

const emit = defineEmits<{ "upload-file": [files: File[]] }>();
const onClick = async () => {
  const fileSystemFileHandles = await showOpenFilePicker({ multiple: true });
  if (fileSystemFileHandles.length === 0) return;
  const files = await Promise.all(fileSystemFileHandles.map((fileSystemFileHandle) => fileSystemFileHandle.getFile()));
  emit("upload-file", files);
};
</script>

<template>
  <StyledTooltipIconButton :button-props="{ size: 'small' }" icon="mdi-plus" text="Upload a File" @click="onClick()" />
</template>
