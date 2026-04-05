<script setup lang="ts">
import { useRoomStore } from "@/store/message/room";
import { useVoiceStore } from "@/store/message/voice";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const voiceStore = useVoiceStore();
const { participantsByRoom } = storeToRefs(voiceStore);
const participants = computed(() => (currentRoomId.value ? (participantsByRoom.value[currentRoomId.value] ?? []) : []));
</script>

<template>
  <v-list v-if="participants.length > 0" density="compact">
    <MessageVoiceParticipant v-for="participant in participants" :key="participant.id" :participant />
  </v-list>
</template>
