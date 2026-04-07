<script setup lang="ts">
import { useRoomStore } from "@/store/message/room";
import { useVoiceStore } from "@/store/message/room/voice";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const voiceStore = useVoiceStore();
const { voiceParticipantsRoomMap } = storeToRefs(voiceStore);
const participants = computed(() =>
  currentRoomId.value ? (voiceParticipantsRoomMap.value.get(currentRoomId.value) ?? []) : [],
);
</script>

<template>
  <v-list v-if="participants.length > 0" density="compact">
    <MessageLeftSideBarVoiceParticipant v-for="participant in participants" :key="participant.id" :participant />
  </v-list>
</template>
