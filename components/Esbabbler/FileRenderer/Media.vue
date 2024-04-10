<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";
import { TypeRendererMap } from "@/models/esbabbler/file/TypeRendererMap";
import { getLanguageForFileUrl } from "@/services/file/code";
import type { Component } from "vue";

const { url, mimetype } = defineProps<FileRendererProps>();
const defaultRenderer = defineAsyncComponent(() => import("@/components/Esbabbler/FileRenderer/Default.vue"));
const language = computed(() => getLanguageForFileUrl(url));
const rendererProps = ref<FileRendererProps & Record<string, unknown>>({ url, mimetype, language });
const renderer = computed<Component>(() => {
  const renderer =
    TypeRendererMap[mimetype] || TypeRendererMap[mimetype.substring(0, mimetype.indexOf("/"))] || defaultRenderer;
  if (renderer !== defaultRenderer || !language.value) return renderer;
  return defineAsyncComponent(() => import("@/components/Esbabbler/FileRenderer/Code.vue"));
});
</script>

<template>
  <component :is="renderer" :="rendererProps" />
</template>
