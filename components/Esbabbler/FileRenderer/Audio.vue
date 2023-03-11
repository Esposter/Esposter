<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";

const props = defineProps<FileRendererProps>();
const { url } = toRefs(props);
</script>

<template>
  <audio :src="url" controls />
</template>
