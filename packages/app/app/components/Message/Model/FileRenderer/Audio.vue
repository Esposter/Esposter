<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

const { url } = defineProps<FileRendererComponentProps>();
</script>

<template>
  <audio :src="url" controls size-full />
</template>
