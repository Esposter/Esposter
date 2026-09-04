<script setup lang="ts">
import type { MessageComponentProps } from "@/models/message/MessageComponentProps";
import type { StandardMessageEntity } from "@esposter/db-schema";

interface Props extends MessageComponentProps<StandardMessageEntity> {}

const { active, creator, isPreview = false, message } = defineProps<Props>();
const isCallEnded = computed(() => Boolean(message.message));
const formattedDuration = computed(() => {
  if (!isCallEnded.value) return;
  // Rounded so the seconds the message carries are balanced across the fields below — an unrounded duration
  // Keeps all of them in `seconds` and every larger part reads zero
  const duration = Temporal.Duration.from({ seconds: Number(message.message) }).round({ largestUnit: "day" });
  return (
    [
      [duration.days, "d"],
      [duration.hours, "h"],
      [duration.minutes, "m"],
      [duration.seconds, "s"],
    ] as [number, string][]
  )
    .filter(([value]) => value > 0)
    .map(([value, unit]) => `${value}${unit}`)
    .join(" ");
});
</script>

<template>
  <MessageModelMessageTypeSystemLine
    :active
    :icon="isCallEnded ? 'mdi-phone-hangup' : 'mdi-phone'"
    :icon-color="isCallEnded ? 'error' : 'success'"
    :is-preview
    :message
  >
    <template v-if="isCallEnded">
      <span op-medium-emphasis>Call ended</span>
      <template v-if="formattedDuration">
        <span op-medium-emphasis> · lasted </span>
        <span font-medium op-medium-emphasis>{{ formattedDuration }}</span>
      </template>
      <span op-medium-emphasis>. </span>
    </template>
    <template v-else>
      <span font-bold>{{ creator.name }}</span>
      <span op-medium-emphasis> started a call. </span>
    </template>
  </MessageModelMessageTypeSystemLine>
</template>
