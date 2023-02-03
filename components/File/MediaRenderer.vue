<script setup lang="ts">
import type { FileRendererProps } from "@/models/file";
import { typeRendererMap } from "@/models/file";
import { getLanguageForUrl } from "@/services/file";
import type { Component } from "vue";

const props = defineProps<FileRendererProps>();
const { url, mimetype } = $(toRefs(props));

const defaultRenderer = defineAsyncComponent(() => import("@/components/File/DefaultRenderer.vue"));
const rendererProps = $ref<FileRendererProps & Record<string, string>>({ url, mimetype });
const renderer = $computed<Component>(() => {
  const result =
    typeRendererMap[mimetype] || typeRendererMap[mimetype.substring(0, mimetype.indexOf("/"))] || defaultRenderer;
  if (result !== defaultRenderer) return result;

  const language = getLanguageForUrl(url);
  if (!language) return result;

  rendererProps.language = language;
  return defineAsyncComponent(() => import("@/components/File/CodeRenderer.vue"));
});
</script>

<template>
  <component :is="renderer" :="rendererProps" />
</template>
