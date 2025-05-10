<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";

const { file } = defineProps<FileRendererProps>();
</script>

<template>
  <NuxtInvisibleLink :href="file.url">
    <StyledCard p-2>
      {{ file.filename }}
      <v-icon icon="mdi-download" />
    </StyledCard>
  </NuxtInvisibleLink>
</template>
