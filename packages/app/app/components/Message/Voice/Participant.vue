<script setup lang="ts">
import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";

interface VoiceParticipantProps {
  isSpeaking: boolean;
  participant: VoiceParticipant;
}

const { isSpeaking, participant } = defineProps<VoiceParticipantProps>();
</script>

<template>
  <v-list-item :title="participant.name">
    <template #prepend>
      <div relative mr-2>
        <StyledAvatar :image="participant.image" :name="participant.name" />
        <div
          v-if="isSpeaking"
          absolute
          inset-0
          rounded-full
          border-2
          border-green-500
          animate-pulse
          pointer-events-none
        />
      </div>
    </template>
    <template #append>
      <v-icon v-if="participant.isMuted" icon="mdi-microphone-off" size="small" />
    </template>
  </v-list-item>
</template>
