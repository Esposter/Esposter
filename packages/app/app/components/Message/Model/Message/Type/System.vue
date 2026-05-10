<script setup lang="ts">
import type { MessageComponentProps } from "@/services/message/MessageComponentMap";
import type { StandardMessageEntity } from "@esposter/db-schema";

interface SystemProps extends MessageComponentProps<StandardMessageEntity> {}

const { active, isPreview = false, message } = defineProps<SystemProps>();
</script>

<template>
  <MessageModelMessageTypeListItem :active :is-preview>
    <template #prepend>
      <v-icon icon="mdi-information-outline" size="small" />
    </template>
    <span italic text-medium-emphasis>{{ message.message }}</span>
    <MessageModelMessageCreatedAtDate :created-at="message.createdAt" />
    <MessageModelMessageEmojiList :is-preview :message />
  </MessageModelMessageTypeListItem>
</template>
