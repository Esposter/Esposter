<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";

const { file } = defineProps<FileRendererProps>();
</script>

<template>
  <video controls>
    <source :src="file.url" />
  </video>
</template>
