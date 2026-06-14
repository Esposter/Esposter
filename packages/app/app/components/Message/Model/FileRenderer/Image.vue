<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

const { file, isPreview, url } = defineProps<FileRendererComponentProps>();
</script>

<template>
  <v-img :src="url" :alt="file.filename" :cover="isPreview" :class="isPreview ? 'size-full' : undefined" />
</template>
