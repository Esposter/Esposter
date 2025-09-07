<script setup lang="ts">
import type { FileRendererProps } from "@/models/message/file/FileRendererProps";

import { getFilesize } from "@/services/file/getFilesize";

const { file, isPreview, url } = defineProps<FileRendererProps>();
const filesize = computed(() => getFilesize(file.size));
</script>

<template>
  <NuxtInvisibleLink :to="url">
    <StyledCard h-full flex flex-col items-center justify-center p-2 display>
      <v-icon icon="mdi-file" :size="isPreview ? '6rem' : 'large'" />
      <v-card-actions v-if="!isPreview">
        {{ file.filename }}
        ({{ filesize }})
      </v-card-actions>
    </StyledCard>
  </NuxtInvisibleLink>
</template>
