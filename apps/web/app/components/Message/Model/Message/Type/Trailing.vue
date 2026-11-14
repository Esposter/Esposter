<script setup lang="ts">
import type { ClientMessage } from "@/models/message/ClientMessage";

interface Props {
  isPreview?: boolean;
  message: ClientMessage;
}

const { isPreview = false } = defineProps<Props>();
</script>

<template>
  <MessageModelMessageFileContainer v-if="message.files.length > 0" max-w-140 :is-preview :message />
  <MessageModelMessageLinkPreviewContainer
    v-if="message.linkPreviewResponse"
    :link-preview-response="message.linkPreviewResponse"
    :message-id="message.id"
    :room-id="message.roomId"
  />
  <MessageModelMessageEmojiList :is-preview :message />
</template>
