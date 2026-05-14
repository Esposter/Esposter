<script setup lang="ts">
import { useCallStore } from "@/store/message/room/call";

const callStore = useCallStore();
const { isCallViewOpen, roomParticipants, speakingIds } = storeToRefs(callStore);
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
