<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";

import { getFilename } from "@/util/getFilename";

const { url } = defineProps<FileRendererProps>();
/**
 * Intentional double decode:
 * the first decode is to unwrap the fact that we need to encode the path
 * the second decode is to decode the filename which is encoded to support utf8
 */
const uniqueFilename = computed(() => decodeURIComponent(decodeURIComponent(getFilename(url))));
const niceFilename = computed(() => uniqueFilename.value.substring(uniqueFilename.value.indexOf(":") + 1));
</script>

<template>
  <NuxtInvisibleLink :href="url" :download="niceFilename">
    <StyledCard pl-2="!" pr-1="!" py-2="!">
      {{ niceFilename }}
      <v-icon icon="mdi-download" />
    </StyledCard>
  </NuxtInvisibleLink>
</template>
