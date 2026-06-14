<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

const { isPreview, url } = defineProps<FileRendererComponentProps>();
</script>

<template>
  <video controls size-full :object-cover="isPreview ? '' : undefined" :object-contain="isPreview ? undefined : ''">
    <source :src="url" />
  </video>
</template>
