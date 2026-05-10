<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

const { url } = defineProps<FileRendererComponentProps>();
</script>

<template>
  <video controls size-full>
    <source :src="url" />
  </video>
</template>
