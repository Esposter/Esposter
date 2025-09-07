<script setup lang="ts">
import type { FileRendererProps } from "@/models/message/file/FileRendererProps";

const { url } = defineProps<FileRendererProps>();
</script>

<template>
  <video size-full controls>
    <source :src="url" />
  </video>
</template>
