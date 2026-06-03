<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

const { url } = defineProps<FileRendererComponentProps>();
</script>

<template>
  <StyledCard p-2 flex items-center justify-center size-full>
    <audio :src="url" controls w-full />
  </StyledCard>
</template>
