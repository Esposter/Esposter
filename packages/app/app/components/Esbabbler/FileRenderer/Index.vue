<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";
import type { Component } from "vue";

import { TypeRendererMap } from "@/models/esbabbler/file/TypeRendererMap";
import { getLanguage } from "@/services/codemirror/getLanguage";

const props = defineProps<FileRendererProps>();
const { file } = toRefs(props);
const language = computed(() => getLanguage(file.value.filename));
const renderer = computed<Component>(() => {
  if (file.value.mimetype in TypeRendererMap) return TypeRendererMap[file.value.mimetype];
  else if (!language.value)
    return defineAsyncComponent(() => import("@/components/Esbabbler/FileRenderer/Default.vue"));
  else return defineAsyncComponent(() => import("@/components/Esbabbler/FileRenderer/Code.vue"));
});
</script>

<template>
  <component :is="renderer" :language :="props" />
</template>
