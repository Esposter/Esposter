<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

import { getFilesize } from "@/services/file/getFilesize";

const { file, isPreview, url } = defineProps<FileRendererComponentProps>();
const filesize = computed(() => getFilesize(file.size));
</script>

<template>
  <NuxtInvisibleLink :to="url">
    <StyledCard p-2 flex flex-col size-full items-center justify-center>
      <v-icon icon="mdi-file" :size="isPreview ? '6rem' : 'large'" />
      <span v-if="!isPreview">
        {{ file.filename }}
        ({{ filesize }})
      </span>
    </StyledCard>
  </NuxtInvisibleLink>
</template>
