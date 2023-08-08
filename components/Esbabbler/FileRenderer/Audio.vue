<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";

const { url } = defineProps<FileRendererProps>();
</script>

<template>
  <audio :src="url" controls />
</template>
