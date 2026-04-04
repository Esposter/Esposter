<script setup lang="ts">
import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";

interface VoiceParticipantProps {
  isSpeaking: boolean;
  participant: VoiceParticipant;
}

const { isSpeaking, participant } = defineProps<VoiceParticipantProps>();
</script>

<template>
  <v-list-item>
    <template #prepend>
      <div relative>
        <StyledAvatar :image="participant.image" :name="participant.name" />
        <div
          v-if="isSpeaking"
          class="absolute inset-0 rounded-full border-2 border-green-500 animate-pulse pointer-events-none"
        />
      </div>
    </template>
    <v-list-item-title>{{ participant.name }}</v-list-item-title>
    <template #append>
      <v-icon v-if="participant.isMuted" icon="mdi-microphone-off" size="small" />
    </template>
  </v-list-item>
</template>
