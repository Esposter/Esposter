<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";
import type { StandardMessageEntity } from "@esposter/db-schema";

import { UiToken } from "@/models/ui/UiToken";

interface Props extends MessageComponentProps<StandardMessageEntity> {}

const { active, creator, isPreview = false, message } = defineProps<Props>();
const isCallEnded = computed(() => Boolean(message.message));
const formattedDuration = computed(() => {
  if (!isCallEnded.value) return "";
  // Rounded so the seconds the message carries are balanced across the fields below — an unrounded duration
  // Keeps all of them in `seconds` and every larger part reads zero
  const duration = Temporal.Duration.from({ seconds: Number(message.message) }).round({ largestUnit: "day" });
  const parts: [number, string][] = [
    [duration.days, "d"],
    [duration.hours, "h"],
    [duration.minutes, "m"],
    [duration.seconds, "s"],
  ];
  return parts
    .filter(([value]) => value > 0)
    .map(([value, unit]) => `${value}${unit}`)
    .join(" ");
});
</script>

<template>
  <MessageModelMessageTypeSystemLine
    :active
    :icon="isCallEnded ? 'i-mdi:phone-hangup' : 'i-mdi:phone'"
    :is-preview
    :message
    :token="isCallEnded ? UiToken.Error : UiToken.Success"
  >
    <template v-if="isCallEnded">
      <span text-muted>Call ended</span>
      <template v-if="formattedDuration">
        <span text-muted> · lasted </span>
        <span>{{ formattedDuration }}</span>
      </template>
      <span text-muted>.</span>
    </template>
    <template v-else>
      <span>{{ creator.name }}</span>
      <span text-muted> started a call.</span>
    </template>
  </MessageModelMessageTypeSystemLine>
</template>
