<script setup lang="ts">
import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";

import { useVoiceStore } from "@/store/message/voice";

interface VoiceParticipantProps {
  participant: VoiceParticipant;
}

const { participant } = defineProps<VoiceParticipantProps>();
const voiceStore = useVoiceStore();
const { speakingIds } = storeToRefs(voiceStore);
const isSpeaking = computed(() => speakingIds.value.includes(participant.id));
</script>

<template>
  <v-list-item :title="participant.name">
    <template #prepend>
      <div relative mr-2>
        <StyledAvatar :image="participant.image" :name="participant.name" />
        <div
          v-if="isSpeaking"
          absolute
          animate-pulse
          inset-0
          outline="2 solid green-500 offset-2"
          pointer-events-none
          rd-full
        />
      </div>
    </template>
    <template #append>
      <v-icon v-if="participant.isMuted" icon="mdi-microphone-off" size="small" />
    </template>
  </v-list-item>
</template>
