<script setup lang="ts">
import type { FileRendererProps } from "@/models/file";
import { typeRendererMap } from "@/models/file";
import { getLanguageForUrl } from "@/services/file";
import type { Component } from "vue";

const props = defineProps<FileRendererProps>();
const { url, mimetype } = $(toRefs(props));

const defaultRenderer = defineAsyncComponent(() => import("@/components/File/DefaultRenderer.vue"));
const renderer = ref<Component>(
  typeRendererMap[mimetype] || typeRendererMap[mimetype.substring(0, mimetype.indexOf("/"))] || defaultRenderer
);
const rendererProps = $ref<FileRendererProps & Record<string, string>>({ url, mimetype });

if (renderer.value === defaultRenderer) {
  const language = getLanguageForUrl(url);
  if (language) {
    renderer.value = defineAsyncComponent(() => import("@/components/File/CodeRenderer.vue"));
    rendererProps.language = language;
  }
}
</script>

<template>
  <component :is="renderer" :="rendererProps" />
</template>
