<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";

const { file, url } = defineProps<FileRendererProps>();
</script>

<template>
  <NuxtInvisibleLink :href="url">
    <StyledCard p-2>
      {{ file.filename }}
      <v-icon icon="mdi-download" />
    </StyledCard>
  </NuxtInvisibleLink>
</template>
