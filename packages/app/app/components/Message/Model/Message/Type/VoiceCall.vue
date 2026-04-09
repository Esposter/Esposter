<script setup lang="ts">
import type { MessageComponentProps } from "@/services/message/MessageComponentMap";
import type { StandardMessageEntity } from "@esposter/db-schema";

interface VoiceCallProps extends MessageComponentProps<StandardMessageEntity> {}

const { active, creator, isPreview = false, message } = defineProps<VoiceCallProps>();
const isCallEnded = computed(() => Boolean(message.message));
const durationInSeconds = computed(() => Number(message.message) || 0);
const formattedDuration = computed(() => {
  const minutes = Math.floor(durationInSeconds.value / 60);
  const seconds = durationInSeconds.value % 60;
  if (minutes === 0) return `${seconds}s`;
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
});
</script>

<template>
  <MessageModelMessageTypeListItem :active :is-preview>
    <template #prepend>
      <v-icon
        :icon="isCallEnded ? 'mdi-phone-hangup' : 'mdi-phone'"
        :color="isCallEnded ? 'error' : 'success'"
        size="small"
      />
    </template>
    <template v-if="isCallEnded">
      <span text-gray>Call ended</span>
      <template v-if="durationInSeconds > 0">
        <span text-gray> · lasted </span>
        <span text-gray font-medium>{{ formattedDuration }}</span>
      </template>
      <span text-gray>. </span>
    </template>
    <template v-else>
      <span font-bold>{{ creator.name }}</span>
      <span text-gray> started a call. </span>
    </template>
    <MessageModelMessageCreatedAtDate :created-at="message.createdAt" />
    <MessageModelMessageEmojiList :is-preview :message />
  </MessageModelMessageTypeListItem>
</template>
