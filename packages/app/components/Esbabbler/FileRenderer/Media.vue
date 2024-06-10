<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";
import { TypeRendererMap } from "@/models/esbabbler/file/TypeRendererMap";
import { getLanguageForFileUrl } from "@/services/codemirror/getLanguageForFileUrl";
import type { Component } from "vue";

const { url, mimetype } = defineProps<FileRendererProps>();
const language = computed(() => getLanguageForFileUrl(url));
const rendererProps = ref<FileRendererProps & Record<string, unknown>>({ url, mimetype, language });
const renderer = computed<Component>(() => {
  if (mimetype in TypeRendererMap) return TypeRendererMap[mimetype];

  const inferredMimetype = mimetype.substring(0, mimetype.indexOf("/"));
  if (inferredMimetype in TypeRendererMap) return TypeRendererMap[inferredMimetype];

  if (!language.value) return defineAsyncComponent(() => import("@/components/Esbabbler/FileRenderer/Default.vue"));
  return defineAsyncComponent(() => import("@/components/Esbabbler/FileRenderer/Code.vue"));
});
</script>

<template>
  <component :is="renderer" :="rendererProps" />
</template>
