<script setup lang="ts">
import type { FileRendererProps } from "@/models/message/file/FileRendererProps";

const { url } = defineProps<FileRendererProps>();
</script>

<template>
  <audio size-full :src="url" controls />
</template>
