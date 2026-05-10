<script setup lang="ts">
import type { MessageComponentProps } from "@/services/message/MessageComponentMap";
import type { StandardMessageEntity } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";

interface VoiceCallProps extends MessageComponentProps<StandardMessageEntity> {}

const { active, creator, isPreview = false, message } = defineProps<VoiceCallProps>();
const isCallEnded = computed(() => Boolean(message.message));
const formattedDuration = computed(() => {
  if (!isCallEnded.value) return;
  const duration = dayjs.duration(Number(message.message), "seconds");
  return (
    [
      [duration.days(), "d"],
      [duration.hours(), "h"],
      [duration.minutes(), "m"],
      [duration.seconds(), "s"],
    ] as [number, string][]
  )
    .filter(([value]) => value > 0)
    .map(([value, unit]) => `${value}${unit}`)
    .join(" ");
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
      <template v-if="formattedDuration">
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
