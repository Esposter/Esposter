<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";

const { file, isPreview, url } = defineProps<FileRendererProps>();
</script>

<template>
  <NuxtInvisibleLink :href="url">
    <StyledCard p-2 h-full display flex flex-col items-center justify-center>
      <v-icon icon="mdi-file" :size="isPreview ? '6rem' : 'large'" />
      <v-card-actions v-if="!isPreview">
        {{ file.filename }}
      </v-card-actions>
    </StyledCard>
  </NuxtInvisibleLink>
</template>
