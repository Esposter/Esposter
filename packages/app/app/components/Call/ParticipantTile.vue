<script setup lang="ts">
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

interface CallParticipantTileProps {
  isDeafened?: boolean;
  isSelf?: boolean;
  isSpeaking?: boolean;
  participant: CallParticipant;
}

const { isDeafened = false, isSelf = false, isSpeaking = false, participant } = defineProps<CallParticipantTileProps>();
</script>

<template>
  <div bg-grey-darken-4 rd-2 flex flex-col aspect-video items-center justify-center relative overflow-hidden>
    <div v-if="isSpeaking" outline="3 solid green-500" rd-2 pointer-events-none inset-0 absolute z-10 animate-pulse />
    <StyledAvatar :image="participant.image" :name="participant.name" :avatar-props="{ size: '96px' }" />
    <div text-sm text-white font-medium flex gap-1 items-center bottom-2 left-2 absolute drop-shadow>
      <span>{{ isSelf ? `${participant.name} (You)` : participant.name }}</span>
      <v-icon v-if="participant.isMuted" icon="mdi-microphone-off" size="x-small" />
      <v-icon v-if="participant.isCameraEnabled" icon="mdi-video" size="x-small" />
      <v-icon v-if="isDeafened" icon="mdi-headphones-off" size="x-small" />
    </div>
  </div>
</template>
