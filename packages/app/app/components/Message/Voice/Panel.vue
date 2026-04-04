<script setup lang="ts">
import { useRoomStore } from "@/store/message/room";
import { useVoiceStore } from "@/store/message/voice";

const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const voiceStore = useVoiceStore();
const { participantsByRoom } = storeToRefs(voiceStore);
const participants = computed(() => (currentRoomId.value ? (participantsByRoom.value[currentRoomId.value] ?? []) : []));

const { isInChannel, isMuted, join, leave, speakingUserIds, toggleMute } = useVoiceChannel();
</script>

<template>
  <v-list-item font-bold>
    Voice
    <template #append>
      <v-tooltip v-if="isInChannel" text="Leave Voice">
        <template #activator="{ props }">
          <v-btn
            :="props"
            icon="mdi-phone-hangup"
            size="small"
            variant="plain"
            bg-transparent
            :ripple="false"
            @click="leave"
          />
        </template>
      </v-tooltip>
      <v-tooltip v-else text="Join Voice">
        <template #activator="{ props }">
          <v-btn :="props" icon="mdi-phone" size="small" variant="plain" bg-transparent :ripple="false" @click="join" />
        </template>
      </v-tooltip>
      <v-tooltip v-if="isInChannel" :text="isMuted ? 'Unmute' : 'Mute'">
        <template #activator="{ props }">
          <v-btn
            :="props"
            :icon="isMuted ? 'mdi-microphone-off' : 'mdi-microphone'"
            size="small"
            variant="plain"
            bg-transparent
            :ripple="false"
            @click="toggleMute"
          />
        </template>
      </v-tooltip>
    </template>
  </v-list-item>
  <MessageVoiceParticipant
    v-for="participant in participants"
    :key="participant.id"
    :participant
    :is-speaking="speakingUserIds.includes(participant.id)"
  />
</template>
