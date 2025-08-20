<script setup lang="ts">
import type { FileRendererProps } from "@/models/message/file/FileRendererProps";

const { file, url } = defineProps<FileRendererProps>();
</script>

<template>
  <v-img :src="url" :alt="file.mimetype" />
</template>
