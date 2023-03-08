<script setup lang="ts">
import type { FileRendererProps } from "@/models/file/FileRendererProps";

const props = defineProps<FileRendererProps>();
const { url, mimetype } = toRefs(props);
</script>

<template>
  <v-img :src="url" :alt="mimetype" />
</template>
