<script setup lang="ts">
import type { LinkPreviewResponse } from "@esposter/db-schema";

import MessageModelMessageLinkPreviewDefault from "@/components/Message/Model/Message/LinkPreview/Default.vue";
import MessageModelMessageLinkPreviewURL from "@/components/Message/Model/Message/LinkPreview/URL.vue";

const { contentType } = defineProps<LinkPreviewResponse>();
const component = computed<Component | undefined>(() => {
  if (contentType === "text/html") return MessageModelMessageLinkPreviewURL;
  else if (contentType) return MessageModelMessageLinkPreviewDefault;
  else return undefined;
});
</script>

<template>
  <component :is="component" :="$props" />
</template>
