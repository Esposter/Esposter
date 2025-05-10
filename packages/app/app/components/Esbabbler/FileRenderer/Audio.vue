<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";

const { file } = defineProps<FileRendererProps>();
</script>

<template>
  <audio :src="file.url" controls />
</template>
