<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";

const { file } = defineProps<FileRendererProps>();
</script>

<template>
  <v-img :src="file.url" :alt="file.description" />
</template>
