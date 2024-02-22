<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";

const { url, mimetype } = defineProps<FileRendererProps>();
</script>

<template>
  <v-img :src="url" :alt="mimetype" />
</template>
