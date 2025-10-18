<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

const { file, url } = defineProps<FileRendererComponentProps>();
</script>

<template>
  <v-img :src="url" :alt="file.mimetype" />
</template>
