<script setup lang="ts">
import type { FileRendererCodeProps } from "@/components/Esbabbler/FileRenderer/Code.vue";
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";
import type { Component } from "vue";

import { TypeRendererMap } from "@/models/esbabbler/file/TypeRendererMap";
import { getLanguage } from "@/services/codemirror/getLanguage";
import { getInferredMimetype } from "@/services/file/getInferredMimetype";

const props = defineProps<FileRendererProps>();
const { file } = toRefs(props);
const language = computed(() => getLanguage(file.value.filename));
const renderer = computed<Component>(() => {
  if (file.value.mimetype in TypeRendererMap) return TypeRendererMap[file.value.mimetype];

  const inferredMimetype = getInferredMimetype(file.value.mimetype);
  if (inferredMimetype in TypeRendererMap) return TypeRendererMap[inferredMimetype];
  else if (!language.value)
    return defineAsyncComponent(() => import("@/components/Esbabbler/FileRenderer/Default.vue"));
  else return defineAsyncComponent(() => import("@/components/Esbabbler/FileRenderer/Code.vue"));
});
const rendererProps = computed(() => {
  const rendererProps: FileRendererProps & Partial<FileRendererCodeProps> = props;
  if (language.value) rendererProps.language = language.value;
  return rendererProps;
});
</script>

<template>
  <component :is="renderer" :="rendererProps" />
</template>
