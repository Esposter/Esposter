<script setup lang="ts">
import type { LinkPreviewResponse } from "@esposter/db-schema";

import MessageModelMessageLinkPreviewDefault from "@/components/Message/Model/Message/LinkPreview/Default.vue";
import MessageModelMessageLinkPreviewURL from "@/components/Message/Model/Message/LinkPreview/URL.vue";

const props = defineProps<LinkPreviewResponse>();
const component = computed<Component | undefined>(() => {
  if (props.contentType === "text/html") return MessageModelMessageLinkPreviewURL;
  else if (props.contentType) return MessageModelMessageLinkPreviewDefault;
  else return undefined;
});
</script>

<template>
  <component :is="component" :="props" />
</template>
