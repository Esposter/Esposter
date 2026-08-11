<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

const { isPreview, url } = defineProps<FileRendererComponentProps>();
</script>

<template>
  <video controls size-full :class="isPreview ? 'object-cover' : 'object-contain'">
    <source :src="url" />
  </video>
</template>
