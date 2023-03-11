<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";
import { TypeRendererMap } from "@/models/esbabbler/file/TypeRendererMap";
import { getLanguageForFileUrl } from "@/services/file/code";
import type { Component } from "vue";

const props = defineProps<FileRendererProps>();
const { url, mimetype } = toRefs(props);

const defaultRenderer = defineAsyncComponent(() => import("@/components/Esbabbler/FileRenderer/Default.vue"));
const rendererProps = ref<FileRendererProps & Record<string, string>>({ url: url.value, mimetype: mimetype.value });
const renderer = computed<Component>(() => {
  const result =
    TypeRendererMap[mimetype.value] ||
    TypeRendererMap[mimetype.value.substring(0, mimetype.value.indexOf("/"))] ||
    defaultRenderer;
  if (result !== defaultRenderer) return result;

  const language = getLanguageForFileUrl(url.value);
  if (!language) return result;

  rendererProps.value.language = language;
  return defineAsyncComponent(() => import("@/components/Esbabbler/FileRenderer/Code.vue"));
});
</script>

<template>
  <component :is="renderer" :="rendererProps" />
</template>
