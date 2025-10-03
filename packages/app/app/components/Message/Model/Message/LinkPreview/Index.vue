<script setup lang="ts">
import type { LinkPreviewResponse } from "#shared/models/message/linkPreview/LinkPreviewResponse";
import type { Component } from "vue";

const props = defineProps<LinkPreviewResponse>();
const { contentType } = toRefs(props);
const component = computed<Component | null>(() => {
  if (contentType.value === "text/html")
    return defineAsyncComponent(() => import("@/components/Message/Model/Message/LinkPreview/URL.vue"));
  else if (contentType.value)
    return defineAsyncComponent(() => import("@/components/Message/Model/Message/LinkPreview/Default.vue"));
  else return null;
});
</script>

<template>
  <component :is="component" :="props" />
</template>
