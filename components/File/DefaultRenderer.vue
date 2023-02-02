<script setup lang="ts">
import type { FileRendererProps } from "@/models/file";

const props = defineProps<FileRendererProps>();
const { url } = $(toRefs(props));
/**
 * Intentional double decode, the first decode is to unwrap the fact that we need to encode the path
 * the second decode is to decode the filename which is encoded to support utf8.
 */
const uniqueFilename = $computed(() => decodeURIComponent(decodeURIComponent(url.substring(url.lastIndexOf("/") + 1))));
const niceFilename = $computed(() => uniqueFilename.substring(uniqueFilename.indexOf(":") + 1));
</script>

<template>
  <InvisibleNuxtLink :href="url" :download="niceFilename">
    <v-icon icon="mdi-download" />
    {{ niceFilename }}
  </InvisibleNuxtLink>
</template>
