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
        <div v-if="isSpeaking" absolute inset-0 rd-full b-2 b-green-500 animate-pulse pointer-events-none />
      </div>
    </template>
    <template #append>
      <v-icon v-if="participant.isMuted" icon="mdi-microphone-off" size="small" />
    </template>
  </v-list-item>
</template>
