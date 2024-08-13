<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";

const { mimetype, url } = defineProps<FileRendererProps>();
</script>

<template>
  <v-img :src="url" :alt="mimetype" />
</template>
