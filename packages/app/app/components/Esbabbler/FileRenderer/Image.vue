<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";

const { file, url } = defineProps<FileRendererProps>();
</script>

<template>
  <v-img :src="url" :alt="file.mimetype" />
</template>
