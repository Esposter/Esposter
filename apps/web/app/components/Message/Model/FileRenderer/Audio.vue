<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

const { url } = defineProps<FileRendererComponentProps>();
</script>

<template>
  <div p-2 flex size-full items-center ui-frame>
    <audio :src="url" controls w-full />
  </div>
</template>
