<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";
import { useParticipantStore } from "@/store/message/room/call/participant";

const callStore = useCallStore();
const { currentRoomCallSessionId, isCallViewOpen } = storeToRefs(callStore);
const participantStore = useParticipantStore();
const { getParticipants } = participantStore;
const { speakingIds } = storeToRefs(participantStore);
const roomParticipants = computed(() => getParticipants(currentRoomCallSessionId.value));
</script>

<template>
  <div px-4 py-2 border-b bg-surface flex gap-x-3 items-center>
    <v-icon icon="mdi-volume-high" size="small" color="success" />
    <span text-sm font-medium flex-1>Call</span>
    <div flex gap-x-2 items-center>
      <MessageContentCallParticipantBarAvatar
        v-for="participant of roomParticipants"
        :key="participant.id"
        :participant
        :is-speaking="speakingIds.includes(participant.id)"
      />
    </div>
    <MessageContentCallAudioControlGroup />
    <MessageContentCallVideoControlGroup />
    <MessageContentCallDeafenButton />
    <MessageContentCallScreenShareButton />
    <MessageContentCallLeaveButton />
    <v-tooltip location="bottom" text="Open call view">
      <template #activator="{ props }">
        <v-btn
          :="props"
          icon="mdi-fullscreen"
          size="x-small"
          variant="text"
          :ripple="false"
          @click="isCallViewOpen = true"
        />
      </template>
    </v-tooltip>
  </div>
</template>
