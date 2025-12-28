<script setup lang="ts">
import type { MessageComponentProps } from "@/services/message/MessageComponentMap";
import type { StandardMessageEntity } from "@esposter/db-schema";

interface PinMessageProps extends MessageComponentProps<StandardMessageEntity> {}

const { active, creator, isPreview = false, message } = defineProps<PinMessageProps>();
const scrollToMessage = useScrollToMessage();
</script>

<template>
  <MessageModelMessageTypeListItem :active :is-preview>
    <template #prepend>
      <v-icon icon="mdi-pin" size="small" />
    </template>
    <span font-bold>{{ creator.name }}</span>
    <span text-gray> pinned </span>
    <span font-bold cursor-pointer hover:underline @click="message.replyRowKey && scrollToMessage(message.replyRowKey)">
      a message</span
    >
    <span text-gray> to this room. </span>
    <MessageModelMessageCreatedAtDate :created-at="message.createdAt" />
    <MessageModelMessageEmojiList :is-preview :message />
  </MessageModelMessageTypeListItem>
</template>
