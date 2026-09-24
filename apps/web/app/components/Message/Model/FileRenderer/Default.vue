<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getFileSize } from "@/services/file/getFileSize";

const { file, isPreview, url } = defineProps<FileRendererComponentProps>();
</script>

<template>
  <!-- A file with no viewer of its own is a card to download it by, its size beside its name outside a preview -->
  <NuxtInvisibleLink
    :to="url"
    :class="isPreview ? 'flex-col justify-center' : undefined"
    ui-card
    flex
    gap-2
    size-full
    items-center
  >
    <UiIcon :meaning="UiIconMeaning.File" shrink-0 />
    <span min-w-0 truncate>{{ file.filename }}</span>
    <span v-if="!isPreview" text-sm text-muted shrink-0>{{ getFileSize(file.size) }}</span>
  </NuxtInvisibleLink>
</template>
