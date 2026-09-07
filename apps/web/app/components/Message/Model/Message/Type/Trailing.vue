<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

interface Props {
  isPreview?: boolean;
  message: MessageEntity;
}

const { isPreview = false, message } = defineProps<Props>();
</script>

<template>
  <MessageModelMessageFileContainer v-if="message.files.length > 0" max-w-140 :is-preview :message />
  <MessageModelMessageLinkPreviewContainer
    v-if="message.linkPreviewResponse"
    :link-preview-response="message.linkPreviewResponse"
    :partition-key="message.partitionKey"
    :row-key="message.rowKey"
  />
  <MessageModelMessageEmojiList :is-preview :message />
</template>
