<script setup lang="ts">
import type { LinkPreviewResponse } from "@esposter/db-schema";

import { MimeType } from "#shared/models/file/MimeType";
import MessageModelMessageLinkPreviewDefault from "@/components/Message/Model/Message/LinkPreview/Default.vue";
import MessageModelMessageLinkPreviewURL from "@/components/Message/Model/Message/LinkPreview/URL.vue";

const { contentType } = defineProps<LinkPreviewResponse>();
const component = computed<Component | undefined>(() => {
  if (contentType === MimeType.Html) return MessageModelMessageLinkPreviewURL;
  else if (contentType) return MessageModelMessageLinkPreviewDefault;
  else return undefined;
});
</script>

<template>
  <component :is="component" :="$props" />
</template>
