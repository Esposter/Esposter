<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

import { getFilesize } from "@/services/file/getFilesize";

const { file, isPreview, url } = defineProps<FileRendererComponentProps>();
const filesize = computed(() => getFilesize(file.size));
</script>

<template>
  <NuxtInvisibleLink :to="url" target="_blank">
    <StyledCard display p-2 flex flex-col size-full min-h-32 items-center justify-center>
      <v-icon icon="mdi-file" :size="isPreview ? '6rem' : 'large'" />
      <v-card-actions v-if="!isPreview">
        {{ file.filename }}
        ({{ filesize }})
      </v-card-actions>
    </StyledCard>
  </NuxtInvisibleLink>
</template>
