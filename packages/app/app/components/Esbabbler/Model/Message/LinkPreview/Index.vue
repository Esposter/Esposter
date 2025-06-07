<script setup lang="ts">
import type { LinkPreviewResponse } from "#shared/models/esbabbler/linkPreview/LinkPreviewResponse";
import type { Component } from "vue";

const props = defineProps<LinkPreviewResponse>();
const { contentType } = toRefs(props);
const component = computed<Component>(() => {
  if (contentType.value === "text/html")
    return defineAsyncComponent(() => import("@/components/Esbabbler/Model/Message/LinkPreview/URL.vue"));
  else return defineAsyncComponent(() => import("@/components/Esbabbler/Model/Message/LinkPreview/Default.vue"));
});
</script>

<template>
  <component :is="component" :="props" />
</template>
