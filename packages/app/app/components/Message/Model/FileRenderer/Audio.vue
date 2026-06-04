<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

const { url } = defineProps<FileRendererComponentProps>();
</script>

<template>
  <StyledCard p-2 flex size-full items-center justify-center>
    <audio :src="url" controls w-full />
  </StyledCard>
</template>
