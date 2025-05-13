<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";

import { getFilesize } from "@/services/file/getFilesize";

const { file, isPreview, url } = defineProps<FileRendererProps>();
const filesize = computed(() => getFilesize(file.size));
</script>

<template>
  <NuxtInvisibleLink :href="url">
    <StyledCard p-2 h-full display flex flex-col items-center justify-center>
      <v-icon icon="mdi-file" :size="isPreview ? '6rem' : 'large'" />
      <v-card-actions v-if="!isPreview">
        {{ file.filename }}
        ({{ filesize }})
      </v-card-actions>
    </StyledCard>
  </NuxtInvisibleLink>
</template>
